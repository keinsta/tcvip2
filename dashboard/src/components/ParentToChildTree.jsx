import React, { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import axiosInstance from "../config/axiosInstance";

const TeamHierarchy = ({ data }) => {
  const renderMember = (member, level = 0) => {
    const hasChildren = member.childrenLength > 0;

    return (
      <div key={member.id} className="space-y-1">
        <div
          className={`flex items-center py-1 pl-${Math.min(
            level * 4,
            40
          )} rounded hover:bg-gray-50`}
        >
          <div
            className="w-1 h-4 bg-blue-500 mr-2"
            style={{ marginLeft: `${level * 12}px` }}
          />
          <span className="font-medium text-gray-800">{member.label}</span>
          <span className="ml-2 text-xs text-gray-500">
            {hasChildren ? `(${member.childrenLength} sub)` : "(No sub)"}
          </span>
        </div>

        {hasChildren &&
          member.children.map((child) => renderMember(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="p-4 bg-white shadow rounded max-h-[80vh] overflow-auto border">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Team Hierarchy
      </h2>
      {renderMember(data)}
    </div>
  );
};

const ParentToChildTree = ({ rootId = "68213e74da5415594a7ffacc" }) => {
  const cyRef = useRef(null); // For the cytoscape instance
  const cyContainerRef = useRef(null); // For the DOM element
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const flattenTreeToElements = (node, parent = null) => {
    let elements = [
      {
        data: { id: node.id, label: node.label || "Unknown" },
      },
    ];

    if (parent) {
      elements.push({
        data: { source: parent.id, target: node.id },
      });
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        elements = elements.concat(flattenTreeToElements(child, node));
      }
    }

    return elements;
  };

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/admin/parent-to-child/${rootId}`);
        setData(res.data);
        const flatElements = flattenTreeToElements(res.data);

        // Destroy previous cytoscape instance if it exists
        if (cyRef.current) {
          cyRef.current.destroy();
        }

        // Ensure the container ref is mounted
        if (cyContainerRef.current) {
          cyRef.current = cytoscape({
            container: cyContainerRef.current,
            elements: flatElements,
            style: [
              {
                selector: "node",
                style: {
                  content: "data(label)",
                  "text-valign": "center",
                  "text-halign": "center",
                  "background-color": "#2563eb",
                  color: "#fff",
                  "text-outline-color": "#2563eb",
                  "text-outline-width": 2,
                  "font-size": "12px",
                  height: 40,
                  width: 40,
                },
              },
              {
                selector: "edge",
                style: {
                  width: 2,
                  "line-color": "#94a3b8",
                  "target-arrow-color": "#94a3b8",
                  "target-arrow-shape": "triangle",
                  "curve-style": "bezier",
                },
              },
            ],
            layout: {
              name: "breadthfirst",
              directed: true,
              padding: 10,
              spacingFactor: 1.3,
            },
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading tree:", err);
        setLoading(false);
      }
    };

    fetchTree();
  }, [rootId]);

  return (
    <>
      {/* <div className="p-6 bg-gray-100 min-h-screen">
        <TeamHierarchy data={data} />
      </div> */}
      <div className="w-full h-screen p-4 bg-gray-800">
        {loading ? (
          <div className="text-center text-gray-400">
            Please wait Tree creating...
          </div>
        ) : (
          <div
            ref={cyContainerRef}
            className="w-full h-full border rounded shadow-md bg-gray-700"
          />
        )}
      </div>
    </>
  );
};

export default ParentToChildTree;
