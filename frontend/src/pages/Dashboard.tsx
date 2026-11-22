import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../utils/api';
import { parseLocalDate, formatEventTimeWithZone, isEventDatePast } from '../utils/dateUtils';
import { Event } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import FavoriteCharities from '../components/FavoriteCharities';
import { isAxiosError, getErrorMessage } from '../utils/errors';
interface Invitation {
  id: number;
  event_id: number;
  email: string;
  name: string;
  rsvp_status: string;
  event_title: string;
  event_slug: string;
  event_date: string;
  event_type: string;
  venue_name: string;
  start_time: string;
  host_first_name: string;
  host_last_name: string;
  additional_guests?: number;
  cancelled?: boolean;
  cancelled_at?: string;
  cancellation_reason?: string;
  event_image_url?: string;
}

type DashboardTab = 'events' | 'invitations';

interface DashboardEventCardProps {
  title: string;
  eventDate: string;
  startTime?: string;
  imageUrl?: string;
  hostLabel: string;
  href: string;
  cancelled?: boolean;
  animationDelay?: number;
  badgeExtra?: ReactNode;
}

function DashboardEventCard({
  title,
  eventDate,
  startTime,
  imageUrl,
  hostLabel,
  href,
  cancelled,
  animationDelay = 0,
  badgeExtra,
}: DashboardEventCardProps) {
  const timingLabel = isEventDatePast(eventDate) ? 'Past' : 'Upcoming';
  const dateLine = format(parseLocalDate(eventDate), 'EEE MMM d, yyyy');
  const timeLine = startTime ? formatEventTimeWithZone(startTime, eventDate) : '';

  return (
    <Link
      to={href}
      className={`card-hover group flex gap-4 sm:gap-5 p-4 sm:p-5 animate-fade-in ${
        cancelled ? 'opacity-90 border border-neutral-300 bg-neutral-50' : ''
      }`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="relative flex-shrink-0 w-20 sm:w-24 aspect-[3/4] rounded-lg overflow-hidden shadow-soft bg-neutral-100">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-300">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        <span className="absolute bottom-1.5 right-1.5 rounded-full bg-neutral-700/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
          {timingLabel}
        </span>
      </div>

      <div className="min-w-0 flex-1 flex flex-col justify-center py-0.5">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3
            className={`text-lg sm:text-xl font-bold leading-snug transition-colors ${
              cancelled
                ? 'text-neutral-600 line-through decoration-neutral-400'
                : 'text-neutral-900 group-hover:text-primary-600'
            }`}
          >
            {title}
          </h3>
          {badgeExtra}
          {cancelled && (
            <span className="badge bg-red-100 text-red-800 border border-red-200 text-xs font-semibold">
              Cancelled
            </span>
          )}
        </div>
        <p className="text-sm sm:text-base text-neutral-800">{dateLine}</p>
        {timeLine && <p className="text-sm text-neutral-700 mt-0.5">{timeLine}</p>}
        <p className="text-sm text-neutral-500 mt-2">{hostLabel}</p>
      </div>
    </Link>
  );
}

type EventTimingFilter = 'current' | 'past';

const defaultTimingFilters = (): Set<EventTimingFilter> => new Set(['current', 'past']);

function matchesEventTimingFilter(eventDate: string, selected: Set<EventTimingFilter>): boolean {
  if (selected.size === 0) return false;
  const past = isEventDatePast(eventDate);
  return (past && selected.has('past')) || (!past && selected.has('current'));
}

function DashboardTimingPills({
  selected,
  onChange,
}: {
  selected: Set<EventTimingFilter>;
  onChange: (next: Set<EventTimingFilter>) => void;
}) {
  const toggle = (key: EventTimingFilter) => {
    const next = new Set(selected);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(next);
  };

  const pillClass = (active: boolean) => dashboardPillButtonClass(active);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter events by timing">
      <button
        type="button"
        onClick={() => toggle('current')}
        className={pillClass(selected.has('current'))}
        aria-pressed={selected.has('current')}
      >
        Current
      </button>
      <button
        type="button"
        onClick={() => toggle('past')}
        className={pillClass(selected.has('past'))}
        aria-pressed={selected.has('past')}
      >
        Past
      </button>
    </div>
  );
}

function DashboardFilteredEmptyState() {
  return (
    <div className="card-info text-center py-12 animate-fade-in max-w-3xl">
      <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
      <h3 className="text-heading-3 mb-2 text-neutral-900">No matching events</h3>
      <p className="text-body text-neutral-600">Turn on Current or Past to see events in that timeframe.</p>
    </div>
  );
}

function DashboardEventCardSkeleton() {
  return (
    <div className="card flex gap-4 sm:gap-5 p-4 sm:p-5 animate-pulse">
      <div className="flex-shrink-0 w-20 sm:w-24 aspect-[3/4] rounded-lg bg-neutral-200" />
      <div className="flex-1 space-y-3 py-2">
        <div className="h-6 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
        <div className="h-4 bg-neutral-200 rounded w-1/3" />
        <div className="h-4 bg-neutral-200 rounded w-2/5" />
      </div>
    </div>
  );
}

const dashboardTabs: DashboardTab[] = ['events', 'invitations'];

const dashboardTabLabels: Record<DashboardTab, string> = {
  events: 'My Events',
  invitations: 'My Invitations',
};

const dashboardTabHelperText: Record<DashboardTab, string> = {
  events: "Events you're hosting",
  invitations: "Events you've been invited to",
};

function dashboardPillButtonClass(active: boolean) {
  return `px-3 py-1 rounded-full text-sm text-neutral-900 bg-transparent transition-all ${
    active ? 'font-semibold ring-1 ring-neutral-900' : 'font-medium'
  }`;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(false);
  const [commitmentsMade, setCommitmentsMade] = useState({ count: 0, amount: 0 });
  const [commitmentsReceived, setCommitmentsReceived] = useState({ count: 0, amount: 0 });
  const [commitmentsLoading, setCommitmentsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('events');
  const [timingFilter, setTimingFilter] = useState<Set<EventTimingFilter>>(defaultTimingFilters);

  const filteredEvents = useMemo(
    () => events.filter((event) => matchesEventTimingFilter(event.event_date, timingFilter)),
    [events, timingFilter]
  );

  const filteredInvitations = useMemo(
    () => invitations.filter((inv) => matchesEventTimingFilter(inv.event_date, timingFilter)),
    [invitations, timingFilter]
  );

  const showTimingFilters =
    (activeTab === 'events' && !eventsLoading && !eventsError && events.length > 0) ||
    (activeTab === 'invitations' && !invitationsLoading && invitations.length > 0);

  useEffect(() => {
    // Wait for auth to finish loading before fetching data
    if (authLoading) return;
    if (!user) return;

    // Load all dashboard data in one call
    fetchDashboardSummary();
  }, [authLoading, user]);

  const fetchDashboardSummary = async (retryCount = 0) => {
    try {
      const response = await api.get('/dashboard/summary', {
        timeout: retryCount === 0 ? 15000 : 20000,
      });

      const { events, invitations, commitments } = response.data;

      // Set all state at once
      setEvents(events || []);
      setEventsLoading(false);

      setInvitations(invitations || []);
      setInvitationsLoading(false);

      setCommitmentsMade({
        count: commitments.made.total_commitments || 0,
        amount: commitments.made.total_amount || 0
      });
      setCommitmentsReceived({
        count: commitments.received.total_commitments || 0,
        amount: commitments.received.total_amount || 0
      });
      setCommitmentsLoading(false);

    } catch (error: unknown) {
      const errorCode = isAxiosError(error) ? error.code : undefined;
      const errorMessage = getErrorMessage(error);
      const hasResponse = isAxiosError(error) ? !!error.response : false;
      const status = isAxiosError(error) ? error.response?.status : undefined;

      const isTimeout = errorCode === 'ECONNABORTED' || errorMessage?.includes('timeout');
      const isNetworkError = !hasResponse && errorMessage === 'Network Error';

      // Retry on timeout or network errors (backend may be waking up from cold start)
      if ((isTimeout || isNetworkError) && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        return fetchDashboardSummary(retryCount + 1);
      }

      console.error('Failed to load dashboard:', error);
      setEventsError(true);
      setEventsLoading(false);
      setInvitationsLoading(false);
      setCommitmentsLoading(false);

      if (isTimeout) {
        toast.error('Request timed out. Please check your connection and try again.');
      } else if (isNetworkError) {
        toast.error('Cannot connect to server. Please try again later.');
      } else if (status !== 401) {
        toast.error('Failed to load dashboard. Please refresh the page.');
      }
    }
  };

  const fetchEvents = async (retryCount = 0) => {
    try {
      setEventsError(false);
      const response = await api.get<Event[]>('/events/my-events', {
        timeout: retryCount === 0 ? 15000 : 20000,
      });
      setEvents(response.data);
    } catch (error: unknown) {
      const errorCode = isAxiosError(error) ? error.code : undefined;
      const errorMessage = getErrorMessage(error);
      const hasResponse = isAxiosError(error) ? !!error.response : false;
      const status = isAxiosError(error) ? error.response?.status : undefined;

      const isTimeout = errorCode === 'ECONNABORTED' || errorMessage?.includes('timeout');
      const isNetworkError = !hasResponse && errorMessage === 'Network Error';

      // Retry on timeout or network errors (backend may be waking up from cold start)
      if ((isTimeout || isNetworkError) && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        return fetchEvents(retryCount + 1);
      }

      console.error('Failed to load events:', error);
      setEventsError(true);
      if (isTimeout) {
        toast.error('Request timed out. Please check your connection and try again.');
      } else if (isNetworkError) {
        toast.error('Cannot connect to server. Please try again later.');
      } else if (status !== 401) {
        toast.error('Failed to load events. Please refresh the page.');
      }
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchInvitations = async (retryCount = 0) => {
    try {
      const response = await api.get<Invitation[]>('/guests/my-invitations', {
        timeout: retryCount === 0 ? 15000 : 20000,
      });
      setInvitations(response.data);
    } catch (error: unknown) {
      const errorCode = isAxiosError(error) ? error.code : undefined;
      const errorMessage = getErrorMessage(error);
      const hasResponse = isAxiosError(error) ? !!error.response : false;

      const isTimeout = errorCode === 'ECONNABORTED' || errorMessage?.includes('timeout');
      const isNetworkError = !hasResponse && errorMessage === 'Network Error';

      if ((isTimeout || isNetworkError) && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        return fetchInvitations(retryCount + 1);
      }

      console.error('Failed to load invitations:', error);
    } finally {
      setInvitationsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-display text-neutral-900 mb-2">Dashboard</h1>
          <p className="text-body-large text-neutral-600">Your events and invitations</p>
        </div>

        <div className="border-b border-neutral-200 mb-6">
          <nav
            className="-mb-px flex flex-wrap items-center gap-x-0.5 sm:gap-x-1"
            role="tablist"
            aria-label="Dashboard sections"
          >
            {dashboardTabs.map((tab, index) => (
              <Fragment key={tab}>
                {index > 0 && (
                  <span
                    className="text-neutral-300 text-sm leading-none select-none px-0.5"
                    aria-hidden="true"
                  >
                    ·
                  </span>
                )}
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2.5 px-1 sm:px-1.5 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {dashboardTabLabels[tab]}
                </button>
              </Fragment>
            ))}
          </nav>
        </div>

        {showTimingFilters && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <DashboardTimingPills selected={timingFilter} onChange={setTimingFilter} />
              <Link
                to="/create-event"
                className="btn btn-primary btn-sm rounded-full !py-1 !min-h-0 font-medium shadow-md"
              >
                + Create Event
              </Link>
            </div>
            <p className="text-sm text-neutral-600 mt-2">{dashboardTabHelperText[activeTab]}</p>
          </div>
        )}

        {activeTab === 'invitations' && (
        <div className="mb-16">
          {invitationsLoading ? (
            <div className="flex flex-col gap-4 max-w-3xl">
              {[1, 2].map((i) => (
                <DashboardEventCardSkeleton key={i} />
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="card-info text-center py-12 animate-fade-in">
              <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-heading-3 mb-2 text-neutral-900">No invitations yet</h3>
              <p className="text-body text-neutral-600">When you receive event invitations, they'll appear here</p>
            </div>
          ) : (
            <>
              {filteredInvitations.length === 0 ? (
                <DashboardFilteredEmptyState />
              ) : (
                <div className="flex flex-col gap-4 max-w-3xl">
                  {filteredInvitations.map((invitation, index) => (
                    <DashboardEventCard
                      key={invitation.id}
                      title={invitation.event_title}
                      eventDate={invitation.event_date}
                      startTime={invitation.start_time}
                      imageUrl={invitation.event_image_url}
                      hostLabel={`Hosted by ${invitation.host_first_name} ${invitation.host_last_name}`.trim()}
                      href={`/event/${invitation.event_slug}?email=${encodeURIComponent(invitation.email)}`}
                      cancelled={invitation.cancelled}
                      animationDelay={index * 50}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        )}

        {activeTab === 'events' && (
        <div className="mb-16">
          {eventsLoading ? (
            <div className="flex flex-col gap-4 max-w-3xl">
              {[1, 2, 3].map((i) => (
                <DashboardEventCardSkeleton key={i} />
              ))}
            </div>
          ) : eventsError ? (
            <div className="card-info text-center py-16 animate-fade-in">
              <svg className="w-16 h-16 text-neutral-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-heading-2 mb-3 text-neutral-900">Unable to load events</h2>
              <p className="text-body-large text-neutral-600 mb-8 max-w-md mx-auto">
                We couldn't connect to the server. Please check your internet connection and try again.
              </p>
              <button
                onClick={() => {
                  setEventsLoading(true);
                  fetchEvents();
                }}
                className="btn btn-primary inline-flex"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="card-info text-center py-16 animate-fade-in">
              <svg className="w-16 h-16 text-neutral-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-heading-2 mb-3 text-neutral-900">No events yet</h2>
              <p className="text-body-large text-neutral-600 mb-8 max-w-md mx-auto">
                Create your first fundraising event and start making an impact
              </p>
              <Link to="/create-event" className="btn btn-primary inline-flex">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Event
              </Link>
            </div>
          ) : (
            <>
              {filteredEvents.length === 0 ? (
                <DashboardFilteredEmptyState />
              ) : (
                <div className="flex flex-col gap-4 max-w-3xl">
                  {filteredEvents.map((event, index) => (
                    <DashboardEventCard
                      key={event.id}
                      title={event.title}
                      eventDate={event.event_date}
                      startTime={event.start_time}
                      imageUrl={event.event_image_url}
                      hostLabel="Hosted by you"
                      href={`/event/${event.slug}/manage`}
                      cancelled={event.cancelled}
                      animationDelay={index * 50}
                      badgeExtra={
                        event.user_role === 'cohost' ? (
                          <span className="badge badge-primary text-xs flex-shrink-0">Co-Host</span>
                        ) : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        )}

        {/* Quick Stats - Commitments Summary */}
        <div className="mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary-100 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-heading-3 text-neutral-900">My Commitments</h2>
                  <p className="text-caption">Donation pledges summary</p>
                </div>
              </div>
              <Link to="/commitments" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {commitmentsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                <div className="h-20 bg-neutral-200 rounded-lg"></div>
                <div className="h-20 bg-neutral-200 rounded-lg"></div>
                <div className="h-20 bg-neutral-200 rounded-lg"></div>
                <div className="h-20 bg-neutral-200 rounded-lg"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <p className="text-caption font-medium mb-1">Made</p>
                  <p className="text-2xl font-bold text-neutral-900">{commitmentsMade.count}</p>
                  <p className="text-caption">pledges</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <p className="text-caption font-medium mb-1">Amount</p>
                  <p className="text-2xl font-bold text-primary-600">${commitmentsMade.amount.toFixed(0)}</p>
                  <p className="text-caption">pledged</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <p className="text-caption font-medium mb-1">Received</p>
                  <p className="text-2xl font-bold text-neutral-900">{commitmentsReceived.count}</p>
                  <p className="text-caption">pledges</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <p className="text-caption font-medium mb-1">Amount</p>
                  <p className="text-2xl font-bold text-primary-600">${commitmentsReceived.amount.toFixed(0)}</p>
                  <p className="text-caption">received</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Favorite Charities Section */}
        <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <FavoriteCharities />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
