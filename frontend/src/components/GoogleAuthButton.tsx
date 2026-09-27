"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAuthButtonProps {
  text?: "signin_with" | "signup_with";
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

export default function GoogleAuthButton({
  text = "signin_with",
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const { login } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [hasClientId, setHasClientId] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [devEmail, setDevEmail] = useState("");
  const [devName, setDevName] = useState("");
  const [isSubmittingDev, setIsSubmittingDev] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (clientId && clientId.includes(".apps.googleusercontent.com")) {
      setHasClientId(true);

      // Load Google Identity Services script
      if (!document.getElementById("google-gsi-client")) {
        const script = document.createElement("script");
        script.id = "google-gsi-client";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleButton;
        document.body.appendChild(script);
      } else {
        initializeGoogleButton();
      }
    } else {
      setHasClientId(false);
    }

    function initializeGoogleButton() {
      if (typeof window !== "undefined" && window.google?.accounts?.id && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: text,
          shape: "pill",
        });
      }
    }

    async function handleCredentialResponse(response: any) {
      if (!response.credential) return;
      try {
        const data = await apiFetch<{ token: string; user: any }>("/auth/google", {
          method: "POST",
          body: { credential: response.credential },
        });

        login(data.token, data.user);
        if (onSuccess) onSuccess();
        else router.push("/templates");
      } catch (err: any) {
        if (onError) onError(err.messa