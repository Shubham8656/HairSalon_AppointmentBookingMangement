import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import services from "./data/Services";

export const migrateServices = async () => {
    console.log("Starting migration of services...");
  try {
    for (const service of services) {
      await addDoc(collection(db, "services"), service);
    }
    console.log("✅ Services migrated");
  } catch (error) {
    console.error("❌ Migration failed", error);
  }
};

