import { Link } from "@tanstack/react-router";
import { BrandMark } from "./yamdy-shell";

export function AuthResult({
  title,
  description,
  error = false,
  children,
}: {
  title: string;
  description: string;
  error?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <main className="signin-page">
      <div className="signin-card auth-result-card">
        <BrandMark />
        <div className={`notice ${error ? "" : "success"}`} role={error ? "alert" : "status"}>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
        <p>
          <Link to="/signin">Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
