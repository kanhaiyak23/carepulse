import Image from "next/image";

import { getPatient } from "@/lib/actions/patient.actions";
import AppointmentForm from "@/components/forms/AppointmentForm";
export default async function NewAppointment({ params }: SearchParamProps) {
  const { userId } = await params;   // get the userId from the URL parameter.

    
    const patient = await getPatient(userId);
    
     // you can use patient data here to populate the form fields.
    
  return (
   <div className="flex h-screen max-h-screen">
    
    <section className="remove-scrollbar container my-auto">
      <div className="sub-container max-w-[860px] flex-1 justify-between">
        <Image src="/assets/icons/logo-full.svg" alt="patient" height={1000} width={1000} className="mb-12 h-10 w-fit "/>

        <AppointmentForm type="create" userId = {userId} patientId = {patient.$id} />
        
          <p className="copyright mt-10 py-12 ">© 2024 CarePulse</p>
          
          
      </div>


    </section>
    <Image src="/assets/images/appointment-img.png" height={1000} width={1000} alt="appointment" className="side-img max-w-[396px] bg-bottom"  />
   </div>
  );
}
