import { ethers } from "ethers";

// Replace with your actual contract ABI and address
import GuardianBadgeABI from "@/lib/abis/GuardianBadge.json";
const GUARDIAN_BADGE_ADDRESS = process.env.NEXT_PUBLIC_GUARDIAN_BADGE_ADDRESS;

export class EmergencyContactsService {
  static getProvider() {
    return new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  }

  static getContract(signerOrProvider?: ethers.Signer | ethers.providers.Provider) {
    return new ethers.Contract(
      GUARDIAN_BADGE_ADDRESS!,
      GuardianBadgeABI,
      signerOrProvider || this.getProvider()
    );
  }

  static async getContacts(): Promise<string[]> {
    const contract = this.getContract();
    return await contract.getEmergencyContacts();
  }

  static async addContact(contact: string, signer: ethers.Signer): Promise<any> {
    const contract = this.getContract(signer);
    const tx = await contract.addEmergencyContact(contact);
    return tx.wait();
  }

  static async removeContact(contact: string, signer: ethers.Signer): Promise<any> {
    const contract = this.getContract(signer);
    const tx = await contract.removeEmergencyContact(contact);
    return tx.wait();
  }
}
