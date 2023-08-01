// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

import mapperGroup from 'beatmap-discussions/mapper-group';
import SelectOptions, { OptionRenderProps } from 'components/select-options';
import UserJson from 'interfaces/user-json';
import { action, makeObservable } from 'mobx';
import { observer } from 'mobx-react';
import BeatmapsetDiscussions from 'models/beatmapset-discussions';
import { usernameSortAscending } from 'models/user';
import * as React from 'react';
import { makeUrl, parseUrl } from 'utils/beatmapset-discussion-helper';
import { groupColour } from 'utils/css';
import { trans } from 'utils/lang';
import { mapBy } from 'utils/map';
import DiscussionsState from './discussions-state';

const allUsers = Object.freeze({
  id: null,
  text: trans('beatmap_discussions.user_filter.everyone'),
});

const noSelection = Object.freeze({
  id: null,
  text: trans('beatmap_discussions.user_filter.label'),
});

interface Option {
  groups: UserJson['groups'];
  id: UserJson['id'] | null;
  text: UserJson['username'];
}

interface Props {
  discussionsState: DiscussionsState;
  store: BeatmapsetDiscussions;
}

function mapUserProperties(user: UserJson): Option {
  return {
    groups: user.groups,
    id: user.id,
    text: user.username,
  };
}

@observer
export class UserFilter extends React.Component<Props> {
  private get ownerId() {
    return this.props.discussionsState.beatmapset.user_id;
  }

  private get selected() {
    return this.props.discussionsState.selectedUser != null
      ? mapUserProperties(this.props.discussionsState.selectedUser)
      : noSelection;
  }

  private get options() {
    const userIdsWithDiscussions = mapBy([...this.props.store.discussions.values()], 'user_id');
    const usersWithDiscussions = [...this.props.store.users.values()]
      .filter((user) => userIdsWithDiscussions.has(user.id))
      .sort(usernameSortAscending);

    return [allUsers, ...[...usersWithDiscussions].map(mapUserProperties)];
  }

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  render() {
    return (
      <SelectOptions
        modifiers='beatmap-discussions-user-filter'
        onChange={this.handleChange}
        options={this.options}
        renderOption={this.renderOption}
        selected={this.selected}
      />
    );
  }

  private getGroup(option: Option) {
    if (this.isOwner(option)) return mapperGroup;
    if (option.groups == null || option.groups.length === 0) return null;
    return option.groups[0];
  }

  @action
  private readonly handleChange = (option: Option) => {
    this.props.discussionsState.selectedUserId = option.id;
  };

  private isOwner(user?: Option) {
    return user != null && user.id === this.ownerId;
  }

  private readonly renderOption = ({ cssClasses, children, onClick, option }: OptionRenderProps<Option>) => {
    const group = this.getGroup(option);
    const style = groupColour(group);

    const urlOptions = parseUrl();
    // means it doesn't work on non-beatmapset discussion paths
    if (urlOptions == null) return null;

    urlOptions.user = option.id ?? undefined;

    return (
      <a
        key={option.id}
        className={cssClasses}
        href={makeUrl(urlOptions)}
        onClick={onClick}
        style={style}
      >
        {children}
      </a>
    );
  };
}
