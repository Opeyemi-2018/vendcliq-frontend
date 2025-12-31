"use client";
import { Card } from "@/components/ui/card";
import { MoveRight } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useStores } from "@/hooks/useStores";

const MyStore = () => {
  const { stores, isLoading, error, refetch } = useStores();
  const router = useRouter();

 
if (error) {
    return (
      <div className="p-5 flex items-center justify-center flex-col gap-3">
       <p className="text-red-600 text-center">{error}</p> 
        <Button onClick={refetch} className="mt-4 bg-[#0A6DC0] hover:bg-[#085a9e]">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex md:items-center md:gap-0 gap-3 justify-between flex-col md:flex-row">
        <div>
          <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
            My Stores
          </h1>
          <p className="font-medium font-dm-sans text-[#9E9A9A]">
            Here are all the details about your stores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push("/dashboards/inventory/create-store")}
            className="bg-[#0A6DC0] hover:bg-[#09599a] w-[50%] md:w-full text-[13px] md:text-[16px] flex gap-2 lg:gap-10 px-6 py-5 md:py-6  text-white"
          >
            + Add New Store
          </Button>
          <Button
            onClick={() => router.push("/dashboards/inventory/add-attendant")}
            className="bg-[#0A2540] hover:bg-[#304c6a]  w-[50%] md:w-full text-[13px] md:text-[16px] flex gap-2 lg:gap-10 px-6 py-5 md:py-6  text-white"
          >
            + Add New Attendant
          </Button>
        </div>
      </div>
      <Card className="p-5 mt-5">
        <h1 className="font-dm-sans text-[#2F2F2F] font-bold">
          My Stores ({stores.length})
        </h1>
        <Card className="mt-3 py-5 relative">
          {isLoading || stores.length === 0 ? (
            <div className="py-20 px-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center">
                  <ThreeDots
                    height="80"
                    width="80"
                    color="#0A6DC0"
                    visible={true}
                  />
                  <p className="mt-4 text-[#9E9A9A] font-dm-sans">
                    Loading stores...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Image
                    src="/store.svg"
                    alt="No store"
                    height={90}
                    width={90}
                  />
                  <p className="font-bold font-dm-sans text-[16px] text-[#2F2F2F]">
                    No store found
                  </p>
                  <p className="text-[#9E9A9A] font-dm-sans">
                    Your store will appear here
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr>
                    <th className="text-left pl-4 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                      Store Name
                    </th>
                    <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                      Store Address
                    </th>
                    <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                      Product Count
                    </th>
                    <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                      Inventory Value
                    </th>
                    <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stores.map((store) => (
                    <tr
                      key={store.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]"
                      onClick={() =>
                        router.push(`/dashboards/inventory/store/${store.id}`)
                      }
                    >
                      <td className="py-4 pl-4 font-medium">{store.name}</td>
                      <td className="py-4">{store.address.name}</td>
                      <td className="py-4">{store.stock_count}</td>
                      <td className="py-4">
                        ₦{store.stock_value.toLocaleString()}
                      </td>
                      <td className="py-4">
                        <MoveRight className="w-5 h-5" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </Card>
    </div>
  );
};

export default MyStore;
