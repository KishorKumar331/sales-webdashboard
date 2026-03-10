import React from "react";
import { useFormContext } from "react-hook-form";
import { Building2, Briefcase, MapPin, Globe, CloudUpload, CreditCard as CardIcon, FileText, Phone, Mail, Hash } from "lucide-react";
import { Card, Field, Input, TextArea, UploadBox } from "../SignUp";

export const OrganizationDetailForm = ({ handleLogoUpload }) => {
    const { register, watch, formState: { errors } } = useFormContext();
    const logourl = watch("logourl");

    return (
        <div className="px-6 space-y-4">
            <Card
                icon={<Building2 className="w-8 h-8" />}
                heading="Organization Details"
                subheading="Help us understand your business better"
                stepNumber={2}
                isActive={true}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Organization ID (Company ID)" required icon={<Hash className="w-4 h-4" />} error={errors.companyid}>
                        <Input
                            {...register("companyid", { required: "Company ID is required" })}
                            placeholder="e.g., lux-travels-99"
                            icon={<Hash className="w-5 h-5" />}
                            hasError={!!errors.companyid}
                        />
                    </Field>

                    <Field label="Company Name" required icon={<Briefcase className="w-4 h-4" />} error={errors.companyname}>
                        <Input
                            {...register("companyname", { required: "Company Name is required" })}
                            placeholder="Enter company name"
                            icon={<Briefcase className="w-5 h-5" />}
                            hasError={!!errors.companyname}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Brand Name" icon={<Briefcase className="w-4 h-4" />}>
                        <Input
                            {...register("brandname")}
                            placeholder="e.g., LuxeGo"
                            icon={<Briefcase className="w-5 h-5" />}
                        />
                    </Field>

                    <Field label="Tagline" icon={<FileText className="w-4 h-4" />}>
                        <Input
                            {...register("tagline")}
                            placeholder="Your Journey, Our Passion"
                            icon={<FileText className="w-5 h-5" />}
                        />
                    </Field>
                </div>

                <Field label="Company Address" required icon={<MapPin className="w-4 h-4" />} error={errors.address}>
                    <TextArea
                        {...register("address", { required: "Company Address is required" })}
                        placeholder="Enter complete company address"
                        rows={3}
                        hasError={!!errors.address}
                    />
                </Field>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Company Website" icon={<Globe className="w-4 h-4" />}>
                        <Input
                            {...register("website")}
                            placeholder="https://www.example.com"
                            type="url"
                            autoCapitalize="none"
                            icon={<Globe className="w-5 h-5" />}
                        />
                    </Field>
                    
                    <Field label="Office Phone" icon={<Phone className="w-4 h-4" />}>
                        <Input
                            {...register("officephone")}
                            placeholder="+91..."
                            inputMode="tel"
                            icon={<Phone className="w-5 h-5" />}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Support Email" icon={<Mail className="w-4 h-4" />}>
                        <Input
                            {...register("supportemail")}
                            placeholder="support@domain.com"
                            type="email"
                            icon={<Mail className="w-5 h-5" />}
                        />
                    </Field>
                    
                    <Field label="Billing Email" icon={<Mail className="w-4 h-4" />}>
                        <Input
                            {...register("billingemail")}
                            placeholder="billing@domain.com"
                            type="email"
                            icon={<Mail className="w-5 h-5" />}
                        />
                    </Field>
                </div>

                <Field label="Upload Company Logo">
                    <UploadBox
                        value={logourl}
                        onChange={handleLogoUpload}
                        acceptHint="PNG, JPG up to 5MB"
                        previewSize={80}
                        emptyIcon={<CloudUpload className="w-8 h-8 text-gray-400" />}
                        emptyText="Upload your company logo"
                        label="Company Logo"
                    />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="GST Number">
                        <Input
                            {...register("companygstnumber", {
                                onChange: (e) => {
                                    e.target.value = e.target.value.toUpperCase();
                                }
                            })}
                            placeholder="Enter GST number"
                            icon={<CardIcon className="w-5 h-5" />}
                        />
                    </Field>

                    <Field label="PAN Number">
                        <Input
                            {...register("pan", {
                                onChange: (e) => {
                                    e.target.value = e.target.value.toUpperCase();
                                }
                            })}
                            placeholder="Enter PAN number"
                            icon={<CardIcon className="w-5 h-5" />}
                        />
                    </Field>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Registration Number">
                        <Input
                            {...register("registrationnumber", {
                                onChange: (e) => {
                                    e.target.value = e.target.value.toUpperCase();
                                }
                            })}
                            placeholder="e.g., U12345DL..."
                            icon={<CardIcon className="w-5 h-5" />}
                        />
                    </Field>

                    <Field label="Tax Region">
                        <Input
                            {...register("taxregion")}
                            placeholder="e.g., Delhi, India"
                            icon={<MapPin className="w-5 h-5" />}
                        />
                    </Field>
                </div>
            </Card>
        </div>
    );
};