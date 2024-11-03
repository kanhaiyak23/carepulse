'use server'
import { DATABASE_ID, APPOINTMENT_COLLECTION_ID, database, messaging } from "../appwrite.config";
import { ID, Query } from "node-appwrite";
import { formatDateTime } from "../utils";
import { parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";
export const createAppointment = async (appointment: CreateAppointmentParams) => {
    try {
        const newAppointment = await database.createDocument(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, ID.unique(), appointment)

        return parseStringify(newAppointment)
    }
    catch (err) {
        console.error("Error creating appointment:", err);
        throw err;
    }
}

export const getAppointment = async (appointmentId: string) => {
    try {
        const appointment = await database.getDocument(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, appointmentId)
        return parseStringify(appointment)
    } catch (err) {
        console.error("Error getting appointment:", err);
        throw err;
    }
}

export const getRecentAppointmentList = async () => {
    try {
        const appointments = await database.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [Query.orderDesc('$createdAt')])
        const initialCounts = {
            scheduledCount: 0, pendingCount: 0, cancelledCount: 0
        }
        const counts = (appointments.documents as Appointment[]).reduce((acc, appointment) => {
            switch (appointment.status) {
                case 'scheduled':
                    acc.scheduledCount++
                    break;
                case 'pending':
                    acc.pendingCount++
                    break;
                case 'cancelled':
                    acc.cancelledCount++
                    break;
            }
            return acc
        }, initialCounts)
        const data = {
            totalCount: appointments.total, ...counts,
            documents: appointments.documents
        }
        return parseStringify(data)

    }
    catch (err) {
        console.error("Error getting recent appointment list:", err);
        throw err;
    }

}
export const updateAppointment = async ({ appointmentId, userId, appointment, type }: UpdateAppointmentParams) => {
    try {
        const updatedAppointment = await database.updateDocument(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, appointmentId, appointment)
        if (!updatedAppointment) {
            throw new Error('Appointment not found')
        }
        console.log(appointment)
        // TODO sms message notification
        const smsMessage = `Hi ${appointment.name}, it's Carepulse. ${type === 'schedule'
                ? `Your appointment has been scheduled for ${formatDateTime(appointment.schedule).dateTime } with Dr.${
                    appointment.primaryPhysician}`
                : `We regret to inform you that your appointment has been cancelled for the following reason: ${appointment.cancellationreason}`
            }`;
        await sendSMSNotification(userId,smsMessage)


        revalidatePath('/admin') //used for show updates
        return parseStringify(updatedAppointment)
    }
    catch (err) {
        console.error("Error updating appointment:", err);

    }


}
export const sendSMSNotification = async (userId: string, content: string) => {
    try {
        const message = await messaging.createSms(ID.unique(), content, [], [userId])
        return parseStringify(message)

    }
    catch (error) {
        console.error("Error sending SMS notification:", error);
    }
}