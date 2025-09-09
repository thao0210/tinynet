// hooks/useItemWithParent.js
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";
import urls from "@/sharedConstants/urls";

export function useItemWithParent({ loadViewContent }) {
  const { id, childId } = useParams();
  const [item, setItem] = useState(null);
  const [parent, setParent] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colItems, setColItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (childId) {
          // fetch con và cha
          const [childRes, parentRes, contribRes] = await Promise.all([
            api.get(`${urls.LIST}/${childId}`),
            api.get(`${urls.LIST}/${id}`),
            api.get(`${urls.CONTRIBUTION}/list/${childId}`)
          ]);
          setItem(childRes.data.item);
          setParent(parentRes.data.item);
          setContributions(contribRes.data || []);
          if (childRes.data.items) {
            setColItems(childRes.data.items)
          }
        } else {
          // fetch item cha
          const [res, contribRes] = await Promise.all([
            api.get(`${urls.LIST}/${id}`),
            api.get(`${urls.CONTRIBUTION}/list/${id}`)
          ]);
          setItem(res.data.item);
          setParent(null);
          setContributions(contribRes.data || []);
          if (res.data.items) {
            setColItems(res.data.items)
          }
        }
      } catch (err) {
        console.error("Failed to fetch item:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, childId, loadViewContent]);

  return { item, parent, contributions, loading, colItems };
}
