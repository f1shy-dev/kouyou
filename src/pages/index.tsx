import { GetServerSideProps } from "next";
import { verifyToken } from "../helpers/verifyToken";

export default ({ authorised }: { authorised: boolean }) => {
  return (
    authorised ? <h1>Authorised</h1> : <h1>Not Authorised</h1>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const authorised = verifyToken(context)
  return {
    props: {
      authorised,
    }, // will be passed to the page component as props
  };
}