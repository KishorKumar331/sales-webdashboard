import React from "react";
import { useFormContext } from "react-hook-form";
import { User, Mail, Phone, Lock } from "lucide-react";
import { Card, Field, Input } from "../SignUp";

export const BasicDetailForm = () => {
    const { register, formState: { errors }, watch } = useFormContext();
    const password = watch("password");

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
                        placeholder="Enter your phone number (e.g. +919876543210)"
                        inputMode="tel"
                        icon={<Phone className="w-5 h-5" />}
                        hasError={!!errors.phone}
                    />
                </Field>

                <Field label="Password" required icon={<Lock className="w-4 h-4" />} error={errors.password}>
                    <Input
                        {...register("password", { 
                            required: "Password is required",
                            minLength: {
                                value: 8,
                                message: "Password must have at least 8 characters"
                            }
                        })}
                        type="password"
                        placeholder="Create a strong password"
                        icon={<Lock className="w-5 h-5" />}
                        hasError={!!errors.password}
                    />
                </Field>

                <Field label="Confirm Password" required icon={<Lock className="w-4 h-4" />} error={errors.confirmPassword}>
                    <Input
                        {...register("confirmPassword", { 
                            required: "Please confirm your password",
                            validate: value => value === password || "Passwords do not match"
                        })}
                        type="password"
                        placeholder="Confirm your password"
                        icon={<Lock className="w-5 h-5" />}
                        hasError={!!errors.confirmPassword}
                    />
                </Field>
            </Card>
        </div>
    );
};
