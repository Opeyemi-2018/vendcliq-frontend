// "use client";
// import BoxOption from "@/components/ui/BoxOption";
// import { Button } from "@/components/ui/button";
// import { RadioGroup } from "@radix-ui/react-radio-group";
// import Link from "next/link";
// import React from "react";
// import { Formik, Form } from "formik";
// import * as Yup from "yup";

// type SignupStepOneProps = {
//   nextStep: (data?: { businessType?: string }) => void;
//   title: string;
// };

// const validationSchema = Yup.object().shape({
//   businessType: Yup.string()
//     .oneOf(
//       ["DISTRIBUTOR", "RETAILER", "WHOLESALER"],
//       "Please select a business type"
//     )
//     .required("Business type is required"),
// });

// const SignupStepOne: React.FC<SignupStepOneProps> = ({ nextStep, title }) => {
//   return (
//     <div className="">
//       <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
//         {title}
//       </h2>
//       <p className="text-sm text-black text-center font-sans mt-5">
//         Select the account type that best meets your needs.
//       </p>

//       <Formik
//         initialValues={{
//           businessType: "DISTRIBUTOR",
//         }}
//         validationSchema={validationSchema}
//         onSubmit={(values) => {
//           // console.log("businessType", values.businessType);
//           nextStep({ businessType: values.businessType });
//         }}
//       >
//         {({ values, setFieldValue }) => (
//           <Form className="mt-5">
//             <RadioGroup
//               className="space-y-6"
//               value={values.businessType}
//               onValueChange={(value) => setFieldValue("businessType", value)}
//             >
//               <BoxOption
//                 value="DISTRIBUTOR"
//                 title="Distributor"
//                 description="For businesses that buy directly from manufacturers and sell to retailers"
//                 iconSrc="/assets/icon/streamline-emojis_delivery-truck.png"
//                 selectedValue={values.businessType}
//               />
//               <BoxOption
//                 value="RETAILER"
//                 title="Retailer"
//                 description="For businesses that buy from distributors and sell to final consumers"
//                 iconSrc="/assets/icon/noto-v1_shopping-cart.png"
//                 selectedValue={values.businessType}
//               />
//               <BoxOption
//                 value="WHOLESALER"
//                 title="Wholesaler"
//                 description="For businesses that buy from distributors and sell to final consumers"
//                 iconSrc="/assets/icon/wholesaler_10103180.png"
//                 selectedValue={values.businessType}
//               />
//             </RadioGroup>

//             <Button
//               type="submit"
//               className="mt-6 text-white w-full rounded-none"
//             >
//               Continue
//             </Button>
//           </Form>
//         )}
//       </Formik>

//       <div className="flex gap-1 items-center justify-center mt-3 font-sans text-sm">
//         <p className="text-black">I already have an account?</p>
//         <Link href={"/"}>
//           <p className="text-primary">Login</p>
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default SignupStepOne;
