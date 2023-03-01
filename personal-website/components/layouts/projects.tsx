// Layout.tsx -- main layout structure for most website pages

// -- Imports ------------------------------------------------------------------
// React & NextJS imports
// MUI imports

// Components imports
import Footer from "../Footer";
import Navbar from "../Navbar";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <>
      <Navbar />
      <main
        style={{
          marginTop: "10vh",
          maxWidth: "90vw",
          overflowWrap: "normal",
          wordWrap: "normal",
          overflow: "hidden",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
