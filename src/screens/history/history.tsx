import './history.scss';

import React from 'react';

import {
  liveQuery,
  Subscription,
} from 'dexie';
import {
  withTranslation,
  WithTranslation,
} from 'react-i18next';

import {
  mdiBookArrowRight,
  mdiCloudSync,
} from '@mdi/js';
import Icon from '@mdi/react';

import LazyImage from '../../components/lazyImage/lazyImage';
import TopBar from '../../components/topBar/topBar';
import driversManager from '../../managers/driversManager';
import settingsManager from '../../managers/settingsManager';
import syncManager from '../../managers/syncManager';
import db, { Record } from '../../models/db';
import {
  listenToEvents,
  RaitoEvents,
  RaitoSubscription,
} from '../../models/events';
import { DetailsManga } from '../../models/manga';
import user from '../../models/user';
import {
  convertRemToPixels,
  translate,
} from '../../utils/utils';
import makeSwipeable, {
  InjectedSwipeableProps,
} from '../swipeableScreen/swipeableScreen';

interface Props extends InjectedSwipeableProps, WithTranslation {}

class History extends React.Component<
  Props,
  { history: Array<Record>; limit: number }
> {
  content: HTMLDivElement | null = null;
  raitoSubscription: RaitoSubscription | null = null;
  historySubscription: Subscription | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      history: [],
      limit: 20,
    };
  }

  componentDidMount() {
    // register for update events
    this.raitoSubscription = listenToEvents(
      [RaitoEvents.settingsChanged, RaitoEvents.screenChanged],
      this.forceUpdate.bind(this)
    );

    // trace for history changes
    this.historySubscription = liveQuery(() =>
      db.history.filter((history) => history.chapterId !== null).toArray()
    ).subscribe((result) => this.setState({ history: result }));
  }

  componentWillUnmount() {
    if (this.historySubscription) this.historySubscription.unsubscribe();

    if (this.raitoSubscription) this.raitoSubscription.unsubscribe();
  }

  shouldLoadMore() {
    if (!this.content) return;
    const element = this.content;

    // check if reached the bottom or not scrollable
    if (
      element.scrollHeight - element.scrollTop === element.clientHeight ||
      (window.innerWidth > window.innerHeight &&
        element.clientHeight < window.innerHeight - convertRemToPixels(5))
    ) {
      this.setState({ limit: this.state.limit + 20 }, () => {
        if (this.state.limit < this.state.history.length) this.shouldLoadMore();
      });
    }
  }

  render(): React.ReactNode {
    const history = this.state.history
      .sort((a, b) => b.datetime - a.datetime)
      .slice(0, this.state.limit);

    return (
      <div className="history">
        <TopBar
          close={this.props.close}
          rightComponent={
            <div className="actions">
              <div
                onClick={() => {
                  if (!user.token) return alert(this.props.t("notLoggedIn"));
                  syncManager.sync();
                }}
              >
                <Icon path={mdiCloudSync} size={1} />
              </div>
              {/* <div
                onClick={() => {
                  // TODO
                  alert("developing");
                }}
              >
                <Icon path={mdiPlaylistEdit} size={1.25} />
              </div> */}
            </div>
          }
        />
        {this.state.history.length === 0 && (
          <div className="empty">
            <p>{this.props.t("noHistory")}</p>
          </div>
        )}
        <div
          className="historyWrapper"
          onScroll={() => this.shouldLoadMore()}
          ref={(ref) => (this.content = ref)}
        >
          <div className="historyContent">
            {history.map((history) => {
              const date = new Date(history.datetime);

              return (
                <div className="record" key={`${history.id}_${history.driver}`}>
                  <LazyImage
                    src={history.thumbnail}
                    onClick={async () => {
                      window.showLoader();
                      // load manga
                      const result = await DetailsManga.get(
                        history.driver,
                        history.id
                      );

                      // pop the loader
                      window.hideLoader();

                      // show details
                      if (result) {
                        (result as DetailsManga).pushDetails();
                      } else {
                        const driver = driversManager.getOrCreate(
                          history.driver
                        );
                        if (driver && driver.isDown)
                          return alert(
                            `${driver.identifier}${this.props.t("isDown")}`
                          );
                      }
                    }}
                  />

                  <div className="info">
                    <h3>{translate(history.title)}</h3>
                    <h4>
                      {this.props.t("lastSeen")}{" "}
                      {translate(history.chapterTitle!)} {this.props.t("page1")}
                      {history.page! + 1}
                      {this.props.t("page2")}
                    </h4>
                    <h5>
                      {this.props.t("updatedTo")} {translate(history.latest)}
                    </h5>
                    {settingsManager.debugMode && (
                      <div className="debugInfo">
                        <p>
                          {history.driver} <i>#{history.id}</i>
                        </p>
                        <p>
                          {date.toLocaleString(undefined, {
                            month: "long",
                            day: "2-digit",
                            year: "numeric",
                            hour12: true,
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                  <div
                    className="continue"
                    onClick={async () => {
                      window.showLoader();
                      // load manga
                      const result = await DetailsManga.get(
                        history.driver,
                        history.id
                      );

                      // pop the loader
                      window.hideLoader();
                      // show details
                      if (result) {
                        (result as DetailsManga).continue();
                      } else {
                        const driver = driversManager.getOrCreate(
                          history.driver
                        );
                        if (driver && driver.isDown)
                          return alert(
                            `${driver.identifier}${this.props.t("isDown")}`
                          );
                      }
                    }}
                  >
                    <Icon path={mdiBookArrowRight} size={1.5} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default makeSwipeable(withTranslation()(History));
