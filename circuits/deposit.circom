pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

/*
 * Deposit Circuit
 * Proves that a user knows a secret and nullifier that hash to a commitment
 * Public inputs: commitment
 * Private inputs: secret, nullifier
 */
template Deposit() {
    // Private inputs
    signal input secret;
    signal input nullifier;
    
    // Public outputs
    signal output commitment;
    
    // Hash the secret and nullifier to create commitment
    component hasher = Poseidon(2);
    hasher.inputs[0] <== secret;
    hasher.inputs[1] <== nullifier;
    
    commitment <== hasher.out;
}

component main {public []} = Deposit();
