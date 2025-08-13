import { useEffect } from "react";

function useClickOutside(ref, callback, exceptionRef) {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                callback && callback()
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback]);
}

export const useClickAnyWhere = (callback) => {
    useEffect(() => {
        function handleClickAnyWhere(event) {
                callback && callback()
        }

        document.addEventListener("mousedown", handleClickAnyWhere);
        return () => {
            document.removeEventListener("mousedown", handleClickAnyWhere);
        };
    }, [callback]);
}

export default useClickOutside;