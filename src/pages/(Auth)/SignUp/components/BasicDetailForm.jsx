import React from "react";
import { useFormContext } from "react-hook-form";
import { User, Mail, Phone } from "lucide-react";
import { Card, Field, Input } from "../SignUp";

export const BasicDetailForm = () => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="px-6 space-y-4">
            <Card
                icon={<User className="w-8 h-8" />}
                heading="Welcome! Let's get started"
                subheading="Tell us about yourself to personalize your experience"
                stepNumber={1}
                isActive={true}
            >
                <Field label="Full Name" required icon={<User className="w-4 h-4" />} error={errors.fullname}>
                    <Input
                        {...register("fullname", { required: "Full Name is required" })}
                        placeholder="Enter your full name"
                        icon={<User className="w-5 h-5" />}
                        hasError={!!errors.fullname}
                    />
                </Field>

                <Field label="Email Address" required icon={<Mail className="w-4 h-4" />} error={errors.email}>
                    <Input
                        {...register("email", { 
                            required: "Email is required",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: "Enter a valid email address"
                            }
                        })}
                        placeholder="Enter your email"
                        type="email"
                        autoCapitalize="none"
                        icon={<Mail className="w-5 h-5" />}
                        hasError={!!errors.email}
                    />
                </Field>

                <Field label="Phone Number" required icon={<Phone className="w-4 h-4" />} error={errors.phone}>
                    <Input
                        {...register("phone", { required: "Phone Number is required" })}
                        placeholder="Enter your phone number"
                        inputMode="tel"
                        icon={<Phone className="w-5 h-5" />}
                        hasError={!!errors.phone}
                    />
                </Field>
            </Card>
        </div>
    );
};
