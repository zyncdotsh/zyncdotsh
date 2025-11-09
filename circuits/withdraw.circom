pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/*
 * Withdraw Circuit
 * Proves that a user knows the secret and nullifier for a commitment in the merkle tree
 * without revealing which commitment or the secret itself
 * Public inputs: root, nullifierHash, recipient
 * Private inputs: secret, nullifier, pathElements, pathIndices
 */
template Withdraw(levels) {
    // Private inputs
    signal input secret;
    signal input nullifier;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    
    // Public inputs
    signal input root;
    signal input nullifierHash;
    signal input recipient;
    
    // Compute commitment from secret and nullifier
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== secret;
    commitmentHasher.inputs[1] <== nullifier;
    signal commitment;
    commitment <== commitmentHasher.out;
    
    // Compute nullifier hash (prevents double spending)
    component nullifierHasher = Poseidon(1);
    nullifierHasher.inputs[0] <== nullifier;
    nullifierHash === nullifierHasher.out;
    
    // Merkle tree proof verification
    component merkleProof[levels];
    signal currentHash[levels + 1];
    currentHash[0] <== commitment;
    
    for (var i = 0; i < levels; i++) {
        merkleProof[i] = Poseidon(2);
        
        // If pathIndices[i] == 0, commitment is left child
        // If pathIndices[i] == 1, commitment is right child
        merkleProof[i].inputs[0] <== currentHash[i] * (1 - pathIndices[i]) + pathElements[i] * pathIndices[i];
        merkleProof[i].inputs[1] <== pathElements[i] * (1 - pathIndices[i]) + currentHash[i] * pathIndices[i];
        
        currentHash[i + 1] <== merkleProof[i].out;
    }
    
    // Verify the computed root matches the public root
    root === currentHash[levels];
}

component main {public [root, nullifierHash, recipient]} = Withdraw(20);
