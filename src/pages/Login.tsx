
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Link to="/" className="block text-center mb-8">
              <div className="bg-gradient-to-r from-education-primary to-education-secondary rounded-lg w-12 h-12 flex items-center justify-center mx-auto">
                <img
                src="../gude.png"  // Replace with your image path
                alt="Logo"
                className="h-7 w-7 rounded-full object-cover"
              />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-center">GUIDMENEXT</h2>
            </Link>
          </div>
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
