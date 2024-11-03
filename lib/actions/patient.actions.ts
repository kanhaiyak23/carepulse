'use server'
import {  ID, Query } from "node-appwrite"
import { BUCKET_ID, DATABASE_ID, PATIENT_COLLECTION_ID, PROJECT_ID, database, users, ENDPOINT } from "../appwrite.config"
import { parseStringify } from "../utils"
import { InputFile } from "node-appwrite/file"
import { storage } from "../appwrite.config"
export const createUser = async (user: CreateUserParams) => {
    console.log("Creating user with data:", user); // Log incoming user data

    try {
        const newuser = await users.create(ID.unique(), user.email, user.phone, undefined, user.name);
        console.log("User created successfully:", newuser); // Log newly created user
        return newuser;
    } catch (error: any) {
        console.error("Error creating user:", JSON.stringify(error, null, 2)); // Detailed error log

        if (error?.code === 409) {
            console.log("User already exists, attempting to retrieve existing user...");
            const documents = await users.list([Query.equal('email', [user.email])]);
            console.log("Documents returned from list:", documents); // Log the result of the list query

            if (documents?.users.length > 0) {
                console.log("Returning existing user:", documents.users[0]); // Log the existing user
                return documents.users[0];
            } else {
                console.warn("No user found with email:", user.email); // Log a warning if no user found
                return null; // or handle this case as needed
            }
        } else {
            console.error("Unexpected error creating user:", error);
            throw error; // Rethrow unexpected errors
        }
    }
};


export const getUser = async (userId: string) => {
    try {
        const user = await users.get(userId)
        return parseStringify(user)
    } catch (error: any) {
        console.error("Error getting user:", error);

    }
}
export const getPatient = async (userId: string) => {
    try {
        const patient = await database.listDocuments(DATABASE_ID!,PATIENT_COLLECTION_ID!,
            [Query.equal('userId',userId)])
            if (patient.documents.length === 0) {
            console.warn(`No patient found for userId: ${userId}`);
            return null; // Return null if no data is found
        }
        return parseStringify(patient.documents[0])    
        
    } catch (error: any) {
        console.error("Error getting user:", error);
    }
}

export const registerPatient = async ({ identificationDocument, ...patient }: RegisterUserParams) => {
    try {

        let file;
        if (identificationDocument) {
            const inputFile = InputFile.fromBuffer(
                identificationDocument?.get('blobFile') as Blob,
                identificationDocument?.get('filename') as string,
            )
            file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
            }
            const newPatient = await database.createDocument(DATABASE_ID!, PATIENT_COLLECTION_ID!, ID.unique(), {
                identificationDocumentId: file?.$id || null,
                identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
                ...patient
            })
            return parseStringify(newPatient)
        
    }
    catch (err) {
        console.error("Error registering patient:", err);
    }

}