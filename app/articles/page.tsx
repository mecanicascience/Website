import ArticlesList from "../home/articles/articles";
import Footer from "../home/footer/footer";
import Navbar from "../home/header/navbar";

export default function Page() {
    return (
        <>
            <Navbar />

            <ArticlesList inverted />

            <Footer />
        </>
    )
}