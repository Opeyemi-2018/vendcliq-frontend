// "use client";

// import { Button } from "@/components/ui/button";
// import Input from "@/components/ui/Field";
// import {
//   handleVerifyPhoneNumber,
//   handleApiError,
// } from "@/lib/utils/api/apiHelper";
// import { useRouter } from "next/navigation";
// import React, { useState } from "react";
// import { IoArrowBack } from "react-icons/io5";
// import { toast } from "react-toastify";

// type SignupStepFiveProps = {
//   nextStep: () => void;
//   title: string;
//   prevStep: () => void;
// };

// const SignupStepFive: React.FC<SignupStepFiveProps> = ({ title, prevStep }) => {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const phone = localStorage.getItem("phone") || "";
//   const [code, setCode] = useState("");

//   const handleSubmit = async () => {
//     if (!code.trim()) {
//       setError("Confirmation code is required.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await handleVerifyPhoneNumber({ token: code });
//       if (response.status === "success") {
//         toast.success(response.msg);
//         router.push("/dashboard/home");
//       }
//     } catch (error) {
//       handleApiError(error, setError);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="">
//       <button
//         onClick={() => prevStep()}
//         className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-800"
//       >
//         <IoArrowBack size={20} />
//         <span>Back</span>
//       </button>
//       <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
//         {title}
//       </h2>
//       <div className="font-sans">
//         <p className="text-gray-600 text-center mt-4">
//           A confirmation code has been sent to your phone number. Please enter
//           the code below to verify your phone number.
//         </p>
//         <div className="mt-10 font-sans">
//           <Input
//             label="Phone Number"
//             placeholder="Enter your phone number"
//             className="flex-1 my-5"
//             value={phone}
//             disabled={true}
//           />
//           <Input
//             label="Confirmation Code"
//             placeholder="Enter your confirmation code"
//             className="flex-1 my-5"
//             value={code}
//             onChange={(e) => setCode(e.target.value)}
//           />
//           {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
//         </div>

//         <Button
//           onClick={handleSubmit}
//           className="mt-6 w-full text-white rounded-none"
//           disabled={loading}
//         >
//           {loading ? "Verifying..." : "Verify"}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default SignupStepFive;
