"use client";
import React, { useState } from "react";
import { Tabs, Tab, Input, Link, Button, Card, CardBody, Autocomplete, AutocompleteItem } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {currentUser} from "@/core/api/localStorageKeys";
import { postData } from "@/core/api/apiHandler";
import { accountRoutes } from "@/core/api/apiRoutes";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useAsyncList } from "@react-stately/data";
import { localBackend } from "@/core/api/axiosInstance";

export default function App() {
  const [loginState, setLoginState] = useState({
    name: "",
    password: "",
  });
  const [signinState, setSiginState] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });
  const router = useRouter();
  const signupMutate = useMutation({
    mutationKey: ["signinMutate"],
    mutationFn: async (siginState: any) => {
      return await postData(accountRoutes.signin, {}, siginState);
    },
    onSuccess: (data: any) => {
      console.log("Success", data.data.data.user);
      localStorage.setItem(currentUser, JSON.stringify(data.data.data));
      Cookies.set(currentUser, data.data.data.user.token);
      setisLoadingLogin(false);
      toast.success('Signed Up Successfully', {
        position: "top-right",
        className: "bg-blue-400"
      });
      const { role } = data.data.data.user;
      if (role === 'BIDDER') {
        router.push('/bidder');
      } else if (role === 'SELLER') {
        router.push('/seller');
      }
      setSiginState({
        name: "",
        email: "",
        role: "",
        password: ""
      });
    },
    onError: (error: any) => {
      console.error(error);
      setisLoadingLogin(false);
      toast.error('Logged In Error', {
        position: "top-right",
        className: "bg-red-400"
      });
    },
  });
  const loginMutate = useMutation({
    mutationKey: ["loginMutate"],
    mutationFn: async (loginState: any) => {
      return await postData(accountRoutes.login, {}, loginState);
    },
    onSuccess: (data: any) => {
      console.log("Success", data.data.data);
      if (data.data.data.isBlocked) {
        toast.error("User has been blocked");
        setisLoadingLogin(false);
        return;
      }
      localStorage.setItem(currentUser, JSON.stringify(data.data.data));
      Cookies.set(currentUser, data.data.data.token);
      setisLoadingLogin(false);
      toast.success('Logged In Successfully', {
        position: "top-right",
        className: "bg-blue-400"
      });
     // const { role } = data.data.data;
      router.push("/admin"); 
    },
    onError: (error: any) => {
      console.error(error);
      setisLoadingLogin(false);
      toast.error('Logged In Error', {
        position: "top-right",
        className: "bg-red-400"
      });
    },
  });
  const [isLoadingLogin, setisLoadingLogin] = useState<boolean>(false);
  const handleChange = (type: string, value: string) => {
    setLoginState((prev) => ({
      ...prev,
      [type]: value,
    }));
  };
  const handleSignupChange = (type: string, value: any) => {
    console.log(type, "value", value);
    setSiginState((prev) => ({
      ...prev,
      [type]: value,
    }));
  };
  const handleSigin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setisLoadingLogin(true);
    signupMutate.mutate(signinState);
  }
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setisLoadingLogin(true);
    console.log("Inside form Submit");
    loginMutate.mutate(loginState);
  }
  const [selected, setSelected] = useState<any>("login");
  let list = useAsyncList({
    async load({ filterText }) {
      let res = await fetch(`${localBackend}role/all/roles/?search=${filterText}`, {});
      console.log(res, "RES");
      let json = await res.json();
      return {
        items: json.data.filter((data: any) => data.name != "ADMIN"),
      };
    },
  });

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen">
      <Card className="max-w-full w-[500px] h-[500px]">
        <CardBody className="overflow-hidden">
          <Tabs
            fullWidth
            aria-label="Tabs form"
            selectedKey={selected}
            size="md"
            onSelectionChange={setSelected}
          >
            <Tab key="login" title="Login">
              <form
                className="flex justify-center items-center h-[400px] flex-col gap-4"
                onSubmit={(e) => handleLogin(e)}
              >
                <Input
                  isRequired
                  label="Username"
                  placeholder="Enter your username"
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                <Input
                  isRequired
                  label="Password"
                  placeholder="Enter your password"
                  onChange={(e) => handleChange("password", e.target.value)}
                  type="password"
                />
                <p className="text-center text-small">
                  Need to create an account?{" "}
                  <Link
                    className="cursor-pointer"
                    size="sm"
                    onPress={() => setSelected("sign-up")}
                  >
                    Sign up
                  </Link>
                </p>
                <div className="flex gap-2 justify-end">
                  <Button type="submit" fullWidth color="primary" isLoading={isLoadingLogin}>
                    Login
                  </Button>
                </div>
              </form>
            </Tab>
            <Tab key="sign-up" title="Sign up">
              <form onSubmit={(e) => handleSigin(e)} className="flex flex-col gap-4 h-[300px]">
                <Input
                  isRequired
                  label="Name"
                  onValueChange={(e) => handleSignupChange("name", e)}
                  placeholder="Enter your name"
                  type="name"
                />
                <Input
                  isRequired
                  label="Email"
                  onValueChange={(e) => handleSignupChange("email", e)}
                  placeholder="Enter your email"
                  type="email"
                />
                <Input
                  isRequired
                  label="Password"
                  onValueChange={(e) => handleSignupChange("password", e)}
                  placeholder="Enter your password"
                  type="password"
                />
                <Autocomplete
                  className="max-w-xl"
                  inputValue={list.filterText}
                  isLoading={list.isLoading}
                  items={list.items}
                  isRequired={true}
                  onSelectionChange={(e) => handleSignupChange("role", e)}
                  label="Select Role"
                  variant="bordered"
                  onInputChange={list.setFilterText}
                >
                  {(item: any) => (
                    <AutocompleteItem key={item._id} className="capitalize">
                      {item.name}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
                <p className="text-center text-small">
                  Already have an account?{" "}
                  <Link
                    size="sm"
                    className="cursor-pointer"
                    onPress={() => setSelected("login")}
                  >
                    Login
                  </Link>
                </p>
                <div className="flex gap-2 justify-end">
                  <Button isLoading={isLoadingLogin} type="submit" fullWidth color="primary">
                    Sign up
                  </Button>
                </div>
              </form>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}

