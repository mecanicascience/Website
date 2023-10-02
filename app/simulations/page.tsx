import Footer from "../home/footer/footer";
import Navbar from "../home/header/navbar";
import SimulationsList from "../home/simulations/simulations";

export default function Page() {
    return (
        <>
            <Navbar />

            <SimulationsList inverted />

            <Footer />
        </>
    )
}