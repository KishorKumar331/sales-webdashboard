import React from "react";
import { useFormContext } from "react-hook-form";
import { CreditCard, Building2, MapPin, QrCode } from "lucide-react";
import { Card, Field, Input, UploadBox } from "./FormLayoutComponents";

export const PaymentDetailForm = ({ handleQRUpload }) => {
    const { register, watch, formState: { errors } } = useFormContext();
    const qrurl = watch("qrurl");

    return (
        <div className="px-6 space-y-4">
            <Card
                icon={<CreditCard className="w-8 h-8" />}
                heading="Payment Setup"
                subheading="Configure your payment methods for seamless transactions"
                stepNumber={3}
                isActive={true}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Bank Name" required icon={<Building2 className="w-4 h-4" />} error={errors.bankname}>
                        <Input
                            {...register("bankname", { required: "Bank Name is required" })}
                            placeholder="Enter bank name"
                            icon={<Building2 className="w-5 h-5" />}
                            hasError={!!errors.bankname}
                        />
                    </Field>

                    <Field label="Branch Name" required icon={<MapPin className="w-4 h-4" />} error={errors.branchname}>
                        <Input
                            {...register("branchname", { required: "Branch Name is required" })}
                            placeholder="Enter branch name"
                            icon={<MapPin className="w-5 h-5" />}
                            hasError={!!errors.branchname}
                        />
                    </Field>
                </div>

                <Field label="Account Number" required icon={<CreditCard className="w-4 h-4" />} error={errors.accountnumber}>
                    <Input
                        {...register("accountnumber", { required: "Account Number is required" })}
                        placeholder="Enter account number"
                        inputMode="numeric"
                        icon={<CreditCard className="w-5 h-5" />}
                        hasError={!!errors.accountnumber}
                    />
                </Field>

                <Field label="IFSC Code" required error={errors.ifsccode}>
                    <Input
                        {...register("ifsccode", { 
                            required: "IFSC Code is required",
                            onChange: (e) => {
                                e.target.value = e.target.value.toUpperCase();
                            }
                        })}
                        placeholder="Enter IFSC code"
                        hasError={!!errors.ifsccode}
                    />
                </Field>

                <Field label="UPI ID">
                    <Input
                        {...register("upiid")}
                        placeholder="yourname@paytm"
                        autoCapitalize="none"
                    />
                </Field>

                <Field label="Payment QR Code">
                    <UploadBox
                        value={qrurl}
                        onChange={handleQRUpload}
                        acceptHint="PNG, JPG up to 2MB"
                        previewSize={100}
                        emptyIcon={<QrCode className="w-8 h-8 text-gray-400" />}
                        emptyText="Upload QR code for payments"
                        label="QR Code"
                    />
                </Field>
            </Card>
        </div>
    );
};