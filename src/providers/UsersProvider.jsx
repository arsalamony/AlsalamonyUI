// src/context/UsersProvider.jsx
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";
import { getUsers } from "../api/user.api";
import { UsersContext } from "../contexts/UsersContext";


export function UsersProvider({ children }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getUsers();
                if (cancelled) return;
                setUsers(Array.isArray(data) ? data : []);
            } catch (e) {
                console.log("Error while Fetching Users: ", e)
                if (cancelled) return;
                setError("فشل تحميل المستخدمين");
                setUsers([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // ✅ utilities سريعة
    const value = useMemo(() => {
        const byId = new Map(users.map((u) => [Number(u.userId), u]));
        return {
            users,
            usersLoading: loading,
            usersError: error,

            // helpers
            getUserName: (id) => byId.get(Number(id))?.name ?? "",

            // manual refresh (لو الادمن فتح صفحة users بعد إضافة/تعديل)
            refreshUsers: async () => {
                try {
                    setLoading(true);
                    setError("");
                    const data = await getUsers();
                    console.log("Users ", data)
                    setUsers(Array.isArray(data) ? data : []);
                } catch {
                    setError("فشل تحميل المستخدمين");
                    setUsers([]);
                } finally {
                    setLoading(false);
                }
            },
        };
    }, [users, loading, error]);

    return (
        <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
    );
}


