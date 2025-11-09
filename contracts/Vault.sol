// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IVerifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[3] calldata _pubSignals
    ) external view returns (bool);
}

/**
 * @title Vault
 * @dev Shielded pool contract for private NFT deposits and withdrawals
 * Uses zk-SNARKs to prove ownership without revealing which NFT
 */
contract Vault is ReentrancyGuard {
    // Merkle tree parameters
    uint256 public constant TREE_LEVELS = 20;
    uint256 public constant FIELD_SIZE = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    
    // State
    uint256 public nextIndex = 0;
    mapping(uint256 => bool) public commitments; // commitment => exists
    mapping(uint256 => bool) public nullifierHashes; // nullifierHash => spent
    mapping(uint256 => bool) public roots; // merkle root => valid
    
    uint256[1048576] public merkleTree; // 2^20 leaves
    uint256 public currentRoot;
    
    IVerifier public depositVerifier;
    IVerifier public withdrawVerifier;
    
    // Events
    event Deposit(uint256 indexed commitment, uint256 leafIndex, uint256 timestamp);
    event Withdrawal(address indexed recipient, uint256 nullifierHash, uint256 timestamp);
    
    constructor(address _depositVerifier, address _withdrawVerifier) {
        depositVerifier = IVerifier(_depositVerifier);
        withdrawVerifier = IVerifier(_withdrawVerifier);
        // Initialize first root as 0
        roots[0] = true;
        currentRoot = 0;
    }
    
    /**
     * @dev Deposit an NFT into the shielded pool
     * @param _commitment Poseidon hash of (secret, nullifier)
     * @param _nftContract Address of the NFT contract
     * @param _tokenId Token ID to deposit
     */
    function deposit(
        uint256 _commitment,
        address _nftContract,
        uint256 _tokenId
    ) external nonReentrant {
        require(!commitments[_commitment], "Commitment already exists");
        require(nextIndex < 2 ** TREE_LEVELS, "Merkle tree is full");
        
        // Transfer NFT to vault
        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);
        
        // Insert commitment into merkle tree
        uint256 leafIndex = nextIndex;
        merkleTree[leafIndex] = _commitment;
        commitments[_commitment] = true;
        nextIndex++;
        
        // Update merkle root (simplified - in production use incremental merkle tree)
        currentRoot = hashLeftRight(currentRoot, _commitment);
        roots[currentRoot] = true;
        
        emit Deposit(_commitment, leafIndex, block.timestamp);
    }
    
    /**
     * @dev Withdraw an NFT from the shielded pool using a zk-SNARK proof
     * @param _proof zk-SNARK proof
     * @param _root Merkle root
     * @param _nullifierHash Hash of nullifier (prevents double-spend)
     * @param _recipient Address to receive the NFT
     * @param _nftContract Address of the NFT contract
     * @param _tokenId Token ID to withdraw
     */
    function withdraw(
        uint[8] calldata _proof,
        uint256 _root,
        uint256 _nullifierHash,
        address _recipient,
        address _nftContract,
        uint256 _tokenId
    ) external nonReentrant {
        require(!nullifierHashes[_nullifierHash], "Note already spent");
        require(roots[_root], "Invalid merkle root");
        
        // Verify the zk-SNARK proof
        uint[2] memory pA = [_proof[0], _proof[1]];
        uint[2][2] memory pB = [[_proof[2], _proof[3]], [_proof[4], _proof[5]]];
        uint[2] memory pC = [_proof[6], _proof[7]];
        uint[3] memory pubSignals = [_root, _nullifierHash, uint256(uint160(_recipient))];
        
        require(
            withdrawVerifier.verifyProof(pA, pB, pC, pubSignals),
            "Invalid withdrawal proof"
        );
        
        // Mark nullifier as spent
        nullifierHashes[_nullifierHash] = true;
        
        // Transfer NFT to recipient
        IERC721(_nftContract).transferFrom(address(this), _recipient, _tokenId);
        
        emit Withdrawal(_recipient, _nullifierHash, block.timestamp);
    }
    
    /**
     * @dev Simple hash function (Poseidon in production)
     */
    function hashLeftRight(uint256 _left, uint256 _right) public pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(_left, _right))) % FIELD_SIZE;
    }
    
    /**
     * @dev Check if a nullifier has been spent
     */
    function isSpent(uint256 _nullifierHash) public view returns (bool) {
        return nullifierHashes[_nullifierHash];
    }
    
    /**
     * @dev Check if a root is valid
     */
    function isKnownRoot(uint256 _root) public view returns (bool) {
        return roots[_root];
    }
}
