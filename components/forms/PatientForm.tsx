"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import  SubmitButton  from "@/components/CustomSubmitbtn";
// import { Input } from "@/components/ui/input";
import CustomFormField from "@/components/CustomFormField";
import { useState } from "react";
import { UserFormValidation } from "@/lib/validation";
import {useRouter} from "next/navigation"
import { createUser } from "@/lib/actions/patient.actions";
export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
}

const PatientForm = () => {
    const router = useRouter();
    const[isLoading,setisLoading] =useState(false);
  // 1. Define your form.
  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name:"",
      email:"",
      phone:""

      

    },
  });

  // 2. Define a submit handler.
  async function onSubmit({name,email,phone}: z.infer<typeof UserFormValidation>) {
    console.log("Submitting:", { name, email, phone });
    setisLoading(true);
    try{
        const userData = {
            name,
            email,
            phone
        } 
        console.log("User Data to be sent:", userData);
        const user = await createUser(userData);
        console.log("Response from createUser:", user);
        if(user){
            router.push(`/patients/${user.$id}/register`)
        }
        else{
            console.log("User creation failed: No user returned")
        }



    }
    catch(error){
        console.error(error);
        // Handle form submission errors.
      // Handle form validation errors.
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
          <h1 className="header">Hi there 👋 </h1>
          <p className="text-dark-700">Schedule your first appointment.</p>
        </section>
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="name"
          label="Full Name"
          placeholder="John Doe"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="email"
          label="Email"
          placeholder="JohnDoe@gmail.com"
          iconSrc="/assets/icons/email.svg"
          iconAlt="email"
        />
         <CustomFormField
          control={form.control}
          fieldType={FormFieldType.PHONE_INPUT}
          name="phone"
          label="phone number"
          placeholder="(555) 123-4567"
          
        />

        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  );
};

export default PatientForm;