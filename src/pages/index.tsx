import { GetServerSideProps } from "next";
import { verifyToken } from "../helpers/verifyToken";

const Index = () => <></>
export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const [authorised, user] = verifyToken(context)

  if (!authorised) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: "/dashboard",
      permanent: false,
    },
  };
}