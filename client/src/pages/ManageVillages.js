import { useEffect, useState } from "react";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import API from "../utils/api";
import toast from "react-hot-toast";
import AddVillageModal from "../components/superadmin/AddVillageModal";


const ManageVillages = () => {

    const [villages, setVillages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedVillage, setSelectedVillage] = useState(null);

    const fetchVillages = async () => {

        try {

            const res = await API.get("/superadmin/villages");

            setVillages(res.data.villages);

        } catch (err) {

            toast.error("Unable to load villages");

        }

    };

    useEffect(() => {

        fetchVillages();

    }, []);

    const deleteVillage = async (id) => {

    try {

        await API.delete(`/superadmin/villages/${id}`);

        toast.success("Village deleted");

        fetchVillages();

    } catch (err) {

        toast.error("Unable to delete village");

    }

};

const editVillage = (village) => {

    setSelectedVillage(village);

    setShowModal(true);

};

    return (

        <div className="app-layout">

            <Sidebar />

            <div className="main-content">

                <Topbar title="Manage Villages" />

                <div className="page-content">

                    <div
                        style={{
                            display:"flex",
                            justifyContent:"space-between",
                            marginBottom:"20px"
                        }}
                    >

                        <h2>Villages</h2>

                        <button
    className="btn btn-primary"
    onClick={() => setShowModal(true)}
>
    + Add Village
</button>

                    </div>

                    <table className="table">

                        <thead>

                            <tr>

                                <th>Village</th>
                                <th>Mandal</th>
                                <th>District</th>
                                <th>Pincode</th>
                                <th>Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                villages.map(village=>(

                                  <tr key={village._id}>

    <td>{village.name}</td>
    <td>{village.mandal}</td>
    <td>{village.district}</td>
    <td>{village.pincode}</td>

    <td>

        <button
            className="btn btn-secondary"
            onClick={() => editVillage(village)}
        >
            Edit
        </button>

        <button
            className="btn btn-danger"
            style={{ marginLeft: 10 }}
            onClick={() => deleteVillage(village._id)}
        >
            Delete
        </button>

    </td>

</tr>
                                ))

                            }

                        </tbody>

                    </table>

                </div>

            </div>
            {showModal && (

    <AddVillageModal
    village={selectedVillage}
    onClose={() => {
        setShowModal(false);
        setSelectedVillage(null);
    }}
    onSuccess={fetchVillages}
/>

)}

        </div>

    );

};

export default ManageVillages;