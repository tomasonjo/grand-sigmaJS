import React, { FC, useEffect, useMemo, useState } from "react";
import { MdCategory } from "react-icons/md";

import { useSigma } from "react-sigma-v2";
import { keyBy, mapValues, sortBy, values } from "lodash";
import Panel from "./Panel";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/all";

const TagsPanel = ({ tags, filters, toggleTag, setTags }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const nodesPerTag = useMemo(() => {
    const index = {};
    graph.forEachNode((_, { tag }) => (index[tag] = (index[tag] || 0) + 1));
    return index;
  }, []);

  const maxNodesPerTag = useMemo(() => Math.max(...values(nodesPerTag)), [nodesPerTag]);
  const visibleTagsCount = useMemo(() => Object.keys(filters.tags).length, [filters]);

  const [visibleNodesPerTag, setVisibleNodesPerTag] = useState(nodesPerTag);
  useEffect(() => {
    // To ensure the graphology instance has up to data "hidden" values for
    // nodes, we wait for next frame before reindexing. This won't matter in the
    // UX, because of the visible nodes bar width transition.
    requestAnimationFrame(() => {
      const index = {};
      graph.forEachNode((_, { tag, hidden }) => !hidden && (index[tag] = (index[tag] || 0) + 1));
      setVisibleNodesPerTag(index);
    });
  }, [filters]);

  const sortedTags = useMemo(
    () => sortBy(tags, (tag) => (tag.key === "unknown" ? Infinity : -nodesPerTag[tag.key])),
    [tags, nodesPerTag],
  );

  return (
    <Panel
      title={
        <>
          <MdCategory className="text-muted" /> Categories
          {visibleTagsCount < tags.length ? (
            <span className="text-muted text-small">
              {" "}
              ({visibleTagsCount} / {tags.length})
            </span>
          ) : (
            ""
          )}
        </>
      }
    >
      <p>
        <i className="text-muted">Click a category to show/hide related pages from the network.</i>
      </p>
      <p className="buttons">
        <button className="btn" onClick={() => setTags(mapValues(keyBy(tags, "key"), () => true))}>
          <AiOutlineCheckCircle /> Check all
        </button>{" "}
        <button className="btn" onClick={() => setTags({})}>
          <AiOutlineCloseCircle /> Uncheck all
        </button>
      </p>
      <ul>
        {sortedTags.map((tag) => {
          const nodesCount = nodesPerTag[tag.key];
          const visibleNodesCount = visibleNodesPerTag[tag.key] || 0;
          return (
            <li
              className="caption-row"
              key={tag.key}
              title={`${nodesCount} page${nodesCount > 1 ? "s" : ""}${
                visibleNodesCount !== nodesCount ? ` (only ${visibleNodesCount} visible)` : ""
              }`}
            >
              <input
                type="checkbox"
                checked={filters.tags[tag.key] || false}
                onChange={() => toggleTag(tag.key)}
                id={`tag-${tag.key}`}
              />
              <label htmlFor={`tag-${tag.key}`}>
                <span
                  className="circle"
                  style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/${tag.image})` }}
                />{" "}
                <div className="node-label">
                  <span>{tag.key}</span>
                  <div className="bar" style={{ width: (100 * nodesCount) / maxNodesPerTag + "%" }}>
                    <div
                      className="inside-bar"
                      style={{
                        width: (100 * visibleNodesCount) / nodesCount + "%",
                      }}
                    />
                  </div>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};

export default TagsPanel;