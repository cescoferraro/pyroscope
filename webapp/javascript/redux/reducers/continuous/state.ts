import type { Profile, Groups } from '@pyroscope/models/src';
import type { Timeline } from '@webapp/models/timeline';
import type { Annotation } from '@webapp/models/annotation';
import type { AppNames } from '@webapp/models/appNames';

type NewAnnotationState =
  | {
      type: 'pristine';
    }
  | { type: 'saving' };

type SingleView =
  | { type: 'pristine'; profile?: Profile }
  | { type: 'loading'; profile?: Profile }
  | {
      type: 'loaded';
      timeline: Timeline;
      profile: Profile;
      annotations: Annotation[];
    }
  | {
      type: 'reloading';
      timeline: Timeline;
      profile: Profile;
      annotations: Annotation[];
    };

type TagExplorerView =
  | {
      type: 'pristine';
      groups: Groups;
      groupByTag: string;
      groupByTagValue: string;
    }
  | {
      type: 'loading';
      groups: Groups;
      groupByTag: string;
      groupByTagValue: string;
    }
  | {
      type: 'loaded';
      groups: Groups;
      groupByTag: string;
      activeTagProfile?: Profile;
      groupByTagValue: string;
    }
  | {
      type: 'reloading';
      groups: Groups;
      groupByTag: string;
      activeTagProfile?: Profile;
      groupByTagValue: string;
    };

type ComparisonView = {
  left:
    | { type: 'pristine'; profile?: Profile }
    | { type: 'loading'; profile?: Profile }
    | { type: 'loaded'; profile: Profile }
    | { type: 'reloading'; profile: Profile };

  right:
    | { type: 'pristine'; profile?: Profile }
    | { type: 'loading'; profile?: Profile }
    | { type: 'loaded'; profile: Profile }
    | { type: 'reloading'; profile: Profile };

  comparisonMode: {
    active: boolean;
    period: {
      label: string;
      ms: number;
    };
  };
};

type DiffView =
  | { type: 'pristine'; profile?: Profile }
  | { type: 'loading'; profile?: Profile }
  | { type: 'loaded'; profile: Profile }
  | { type: 'reloading'; profile: Profile };

type TimelineState =
  | { type: 'pristine'; timeline: Timeline }
  | { type: 'loading'; timeline: Timeline }
  | { type: 'reloading'; timeline: Timeline }
  | { type: 'loaded'; timeline: Timeline };

type TagsData =
  | { type: 'pristine' }
  | { type: 'loading' }
  | { type: 'failed' }
  | { type: 'loaded'; values: string[] };

// Tags really refer to each application
// Should we nest them to an application?
export type TagsState =
  | { type: 'pristine'; tags: Record<string, TagsData> }
  | { type: 'loading'; tags: Record<string, TagsData> }
  | {
      type: 'loaded';
      tags: Record<string, TagsData>;
      from: number;
      until: number;
    }
  | { type: 'failed'; tags: Record<string, TagsData> };

// TODO
type appName = string;
type Tags = Record<appName, TagsState>;

export interface ContinuousState {
  from: string;
  until: string;
  leftFrom: string;
  leftUntil: string;
  rightFrom: string;
  rightUntil: string;
  query: string;
  leftQuery?: string;
  rightQuery?: string;
  maxNodes: string;
  refreshToken?: string;

  singleView: SingleView;
  diffView: DiffView;
  comparisonView: ComparisonView;
  tagExplorerView: TagExplorerView;
  newAnnotation: NewAnnotationState;
  tags: Tags;

  appNames:
    | { type: 'loaded'; data: AppNames }
    | { type: 'reloading'; data: AppNames }
    | { type: 'failed'; data: AppNames };

  // Since both comparison and diff use the same timeline
  // Makes sense storing them separately
  leftTimeline: TimelineState;
  rightTimeline: TimelineState;
}
