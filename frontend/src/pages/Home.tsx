import { useEffect, useState } from "react";
import { me } from "../api";

export default function Home() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        me().then(setData).catch(console.error);
    }, []);

    return (
        <div>
            <h1>Home</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
