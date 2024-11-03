import React from "react";
import Image from "next/image";

import { redirect } from "next/navigation";
import RegisterForm from "@/components/forms/RegisterForm";
import { getUser,getPatient } from "@/lib/actions/patient.actions";
const register = async({ params }: { params: { userId: string } })=>{
   const userId = params.userId;
  const user = await getUser(userId);
   const patient = await getPatient(userId);
   if (patient) redirect(`/patients/${userId}/new-appointment`);
  
  

   
    
    return(
        <div className="flex h-screen max-h-screen">
        
        <section className="remove-scrollbar container ">
          <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
            <Image src="/assets/icons/logo-full.svg" alt="patient" height={1000} width={1000} className="mb-12 h-10 w-fit "/>
    
           
             <RegisterForm user={user}/>
            
              <p className="copyright py-12 ">© 2024 CarePulse</p>
              
           
          </div>
         
    
    
        </section>
        <Image src="/assets/images/register-img.png" height={1000} width={1000} alt="patient" className="side-img max-w-[390px]"  />
       </div>
    )
}
export default register;