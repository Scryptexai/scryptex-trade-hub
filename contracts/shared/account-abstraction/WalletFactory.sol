
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SmartWallet.sol";

contract WalletFactory is Ownable {
    address public immutable walletImplementation;
    address public immutable entryPoint;
    
    mapping(bytes32 => address) public wallets; // socialHash => wallet address
    mapping(address => SocialProfile) public profiles;
    
    struct SocialProfile {
        string provider; // 'google', 'twitter', 'discord'
        string socialId;
        string email;
        string username;
        bool isActive;
        uint256 createdAt;
    }
    
    event WalletCreated(
        address indexed wallet,
        address indexed owner,
        bytes32 indexed socialHash,
        string provider,
        string socialId
    );
    
    event ProfileUpdated(
        address indexed wallet,
        string provider,
        string socialId,
        string email,
        string username
    );
    
    constructor(address _entryPoint) {
        entryPoint = _entryPoint;
        walletImplementation = address(new SmartWallet());
    }
    
    function createWallet(
        address owner,
        string calldata provider,
        string calldata socialId,
        string calldata email,
        string calldata username,
        uint256 salt
    ) external returns (address wallet) {
        bytes32 socialHash = keccak256(abi.encodePacked(provider, socialId));
        
        // Check if wallet already exists for this social account
        require(wallets[socialHash] == address(0), "Wallet already exists");
        
        bytes memory deploymentData = abi.encodePacked(
            type(SmartWallet).creationCode,
            abi.encode(owner, entryPoint, provider, socialId)
        );
        
        bytes32 salt2 = keccak256(abi.encodePacked(socialHash, salt));
        wallet = Create2.deploy(0, salt2, deploymentData);
        
        // Initialize the wallet
        SmartWallet(payable(wallet)).initialize(owner, entryPoint, provider, socialId);
        
        // Store mappings
        wallets[socialHash] = wallet;
        profiles[wallet] = SocialProfile({
            provider: provider,
            socialId: socialId,
            email: email,
            username: username,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit WalletCreated(wallet, owner, socialHash, provider, socialId);
        emit ProfileUpdated(wallet, provider, socialId, email, username);
    }
    
    function getWalletAddress(
        string calldata provider,
        string calldata socialId,
        uint256 salt
    ) external view returns (address) {
        bytes32 socialHash = keccak256(abi.encodePacked(provider, socialId));
        
        bytes memory deploymentData = abi.encodePacked(
            type(SmartWallet).creationCode,
            abi.encode(address(0), entryPoint, provider, socialId) // owner will be set during init
        );
        
        bytes32 salt2 = keccak256(abi.encodePacked(socialHash, salt));
        return Create2.computeAddress(salt2, keccak256(deploymentData));
    }
    
    function getWalletBySocial(
        string calldata provider,
        string calldata socialId
    ) external view returns (address) {
        bytes32 socialHash = keccak256(abi.encodePacked(provider, socialId));
        return wallets[socialHash];
    }
    
    function updateProfile(
        address wallet,
        string calldata email,
        string calldata username
    ) external {
        require(SmartWallet(payable(wallet)).owner() == msg.sender, "Not wallet owner");
        
        SocialProfile storage profile = profiles[wallet];
        require(profile.isActive, "Profile not found");
        
        profile.email = email;
        profile.username = username;
        
        emit ProfileUpdated(wallet, profile.provider, profile.socialId, email, username);
    }
    
    function deactivateProfile(address wallet) external {
        require(SmartWallet(payable(wallet)).owner() == msg.sender, "Not wallet owner");
        
        profiles[wallet].isActive = false;
    }
    
    function isWalletValid(address wallet) external view returns (bool) {
        return profiles[wallet].isActive;
    }
    
    function getProfile(address wallet) external view returns (SocialProfile memory) {
        return profiles[wallet];
    }
    
    // Batch wallet creation for efficiency
    function createWalletsBatch(
        address[] calldata owners,
        string[] calldata providers,
        string[] calldata socialIds,
        string[] calldata emails,
        string[] calldata usernames,
        uint256[] calldata salts
    ) external returns (address[] memory wallets) {
        require(owners.length == providers.length, "Length mismatch");
        require(owners.length == socialIds.length, "Length mismatch");
        require(owners.length == emails.length, "Length mismatch");
        require(owners.length == usernames.length, "Length mismatch");
        require(owners.length == salts.length, "Length mismatch");
        
        wallets = new address[](owners.length);
        
        for (uint256 i = 0; i < owners.length; i++) {
            wallets[i] = this.createWallet(
                owners[i],
                providers[i],
                socialIds[i],
                emails[i],
                usernames[i],
                salts[i]
            );
        }
    }
}
