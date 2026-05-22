import Footer from "./Footer";
import Header from "./Header";
import Welcome from "./Welcome";

const Landing = ({ auth }) => {
  return (
    <>
      <Header auth={auth} />
      <Welcome />
      <Footer />
    </>
  );
};

export default Landing;
