import { redirect } from "next/navigation";

/** PDF upload is managed on the chapters page. */
export default function TutorPdfsRedirectPage() {
  redirect("/tutor/chapters");
}
