import React, { useState } from 'react';
import 'react-dom';
import { TagsState } from '@webapp/redux/reducers/continuous';
import Dropdown, {
  SubMenu,
  MenuItem,
  FocusableItem,
  MenuGroup,
} from '@webapp/ui/Dropdown';
import { Query, brandQuery } from '@webapp/models/query';
import Input from '@webapp/ui/Input';
import { appendLabelToQuery } from '@webapp/util/query';
import QueryInput from '@webapp/components/QueryInput/QueryInput';

interface TagsBarProps {
  /** callback for when a label is selected */
  onSelectedLabel: (label: string, query: Query) => void;
  /** the state with existing tags */
  tags: TagsState;

  /** the current query */
  query: Query;
  /** callback for when a new query is selected */
  onSetQuery: (q: Query) => void;
  /** callback for when the same query is submitted again */
  onRefresh: () => void;
}

/*
 * Tag Selector + Query Input component
 */
function TagsBar({
  onSetQuery,
  query,
  tags,
  onSelectedLabel,
  onRefresh,
}: TagsBarProps) {
  const CustomDropdown = (() => {
    const noTagsAvailable = (
      <Dropdown label="Select Tag">
        <MenuItem>No tags available</MenuItem>
      </Dropdown>
    );

    if (tags?.type === 'loaded' && Object.keys(tags?.tags || {}).length <= 0) {
      return noTagsAvailable;
    }

    switch (tags.type) {
      case 'loading': {
        return (
          <Dropdown label="Select Tag">
            <MenuItem>Loading</MenuItem>
          </Dropdown>
        );
      }

      case 'loaded': {
        return (
          <LabelsSubmenu
            query={query}
            labels={tags.tags}
            onSelectedLabel={(label) => {
              // if nothing changed there's no point bubbling up
              if (!tags.tags[label] || tags.tags[label].type !== 'loaded') {
                onSelectedLabel(label, query);
              }
            }}
            onSelectedLabelValue={(label, labelValue) => {
              const newQuery = appendLabelToQuery(query, label, labelValue);
              onSetQuery(brandQuery(newQuery));
            }}
          />
        );
      }

      default:
      case 'failed': {
        // There's no need to show anything
        // Since it's likely that a toast already showed something went wrong
        return noTagsAvailable;
      }
    }
  })();

  return (
    <div className="tags-bar _rc-menu-container--theme-dark">
      {CustomDropdown}
      <QueryInput
        initialQuery={query}
        onSubmit={(q) => {
          if (q === query) {
            onRefresh();
          } else {
            onSetQuery(brandQuery(q));
          }
        }}
      />
    </div>
  );
}

interface LabelsSubmenuProps {
  query: Query;
  labels: TagsState['tags'];
  onSelectedLabel: (tag: string) => void;
  onSelectedLabelValue: (label: string, labelValue: string) => void;
}

function LabelsSubmenu({
  query,
  labels: tags,
  onSelectedLabel,
  onSelectedLabelValue,
}: LabelsSubmenuProps) {
  // TODO: type this properly
  const [filter, setFilter] = useState<Record<string, string>>({});

  const GetTagValues = (labelName: string, t: typeof tags[1]) => {
    const { type } = t;
    switch (type) {
      case 'loading': {
        return <MenuItem>Loading</MenuItem>;
      }

      case 'loaded': {
        const { values } = t;

        return (
          values
            // filter only the ones that match the filter
            .filter((n) => {
              const f = filter[labelName]
                ? filter[labelName].trim().toLowerCase()
                : '';
              return n.toLowerCase().includes(f);
            })
            .map((labelValue) => {
              return (
                <MenuItem
                  key={labelValue}
                  value={labelValue}
                  onClick={() => onSelectedLabelValue(labelName, labelValue)}
                  className={
                    isLabelInQuery(query, labelName, labelValue) ? 'active' : ''
                  }
                >
                  {labelValue}
                </MenuItem>
              );
            })
        );
      }

      default:
      case 'failed':
      case 'pristine': {
        return null;
      }
    }
  };

  const GetFilter = (label: string) => {
    return (
      <FocusableItem>
        {({ ref }) => (
          <Input
            ref={ref}
            name="Search Tags Input"
            className="search"
            type="text"
            placeholder="Type a tag..."
            value={filter[label] || ''}
            onChange={(e) =>
              setFilter({
                ...filter,
                [label]: e.target.value,
              })
            }
          />
        )}
      </FocusableItem>
    );
  };

  const Items = Object.entries(tags).map(([tag, tagValues]) => {
    return (
      <SubMenu
        key={tag}
        overflow="auto"
        position="initial"
        onChange={(open) => {
          // we are opening the menu for the first time
          if (open && tagValues.type !== 'loaded') {
            onSelectedLabel(tag);
          }
        }}
        label={() => (
          <span
            className="tag-content"
            aria-hidden
            onClick={() => onSelectedLabel(tag)}
          >
            {tag}
          </span>
        )}
      >
        {GetFilter(tag)}
        <MenuGroup takeOverflow>{GetTagValues(tag, tagValues)}</MenuGroup>
      </SubMenu>
    );
  });

  return <Dropdown label="Select Tag">{Items}</Dropdown>;
}

// Identifies whether a label is in a query or not
function isLabelInQuery(query: string, label: string, labelValue: string) {
  return query.includes(`${label}="${labelValue}"`);
}

export default TagsBar;
