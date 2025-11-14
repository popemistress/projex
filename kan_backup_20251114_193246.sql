--
-- PostgreSQL database dump
--

\restrict vmDUp9H4Za9NHBNSWOaDVcreQ0D6UJiAJfu5FmYmzkSbsoenVIuFprC7cbzehq5

-- Dumped from database version 17.6 (Ubuntu 17.6-0ubuntu0.25.04.1)
-- Dumped by pg_dump version 17.6 (Ubuntu 17.6-0ubuntu0.25.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: kan_user
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO kan_user;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: kan_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO kan_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: kan_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: board_type; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.board_type AS ENUM (
    'regular',
    'template'
);


ALTER TYPE public.board_type OWNER TO kan_user;

--
-- Name: board_visibility; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.board_visibility AS ENUM (
    'private',
    'public'
);


ALTER TYPE public.board_visibility OWNER TO kan_user;

--
-- Name: card_activity_type; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.card_activity_type AS ENUM (
    'card.created',
    'card.updated.title',
    'card.updated.description',
    'card.updated.index',
    'card.updated.list',
    'card.updated.label.added',
    'card.updated.label.removed',
    'card.updated.member.added',
    'card.updated.member.removed',
    'card.updated.comment.added',
    'card.updated.comment.updated',
    'card.updated.comment.deleted',
    'card.updated.checklist.added',
    'card.updated.checklist.renamed',
    'card.updated.checklist.deleted',
    'card.updated.checklist.item.added',
    'card.updated.checklist.item.updated',
    'card.updated.checklist.item.completed',
    'card.updated.checklist.item.uncompleted',
    'card.updated.checklist.item.deleted',
    'card.archived'
);


ALTER TYPE public.card_activity_type OWNER TO kan_user;

--
-- Name: file_type; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.file_type AS ENUM (
    'folder',
    'list',
    'docx',
    'md',
    'pdf',
    'jpg',
    'png',
    'gif',
    'epub'
);


ALTER TYPE public.file_type OWNER TO kan_user;

--
-- Name: goal_activity_type; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.goal_activity_type AS ENUM (
    'goal.created',
    'goal.updated.title',
    'goal.updated.description',
    'goal.updated.status',
    'goal.updated.progress',
    'goal.updated.priority',
    'goal.updated.dates',
    'goal.milestone.added',
    'goal.milestone.completed',
    'goal.card.linked',
    'goal.card.unlinked',
    'goal.archived',
    'goal.completed'
);


ALTER TYPE public.goal_activity_type OWNER TO kan_user;

--
-- Name: goal_status; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.goal_status AS ENUM (
    'not_started',
    'in_progress',
    'completed',
    'on_hold',
    'abandoned'
);


ALTER TYPE public.goal_status OWNER TO kan_user;

--
-- Name: goal_timeframe; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.goal_timeframe AS ENUM (
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'yearly',
    'long_term'
);


ALTER TYPE public.goal_timeframe OWNER TO kan_user;

--
-- Name: goal_type; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.goal_type AS ENUM (
    'personal',
    'professional',
    'health',
    'finance',
    'learning',
    'relationships',
    'creativity',
    'other'
);


ALTER TYPE public.goal_type OWNER TO kan_user;

--
-- Name: habit_category; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.habit_category AS ENUM (
    'health',
    'productivity',
    'learning',
    'relationships',
    'finance',
    'creativity',
    'mindfulness',
    'physical_mastery',
    'mental_mastery',
    'financial_mastery',
    'social_mastery',
    'spiritual_mastery',
    'other'
);


ALTER TYPE public.habit_category OWNER TO kan_user;

--
-- Name: habit_frequency; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.habit_frequency AS ENUM (
    'daily',
    'weekly',
    'monthly',
    'custom',
    'every_few_days',
    'times_per_week',
    'times_per_month',
    'times_per_year',
    'select_dates',
    'none'
);


ALTER TYPE public.habit_frequency OWNER TO kan_user;

--
-- Name: habit_status; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.habit_status AS ENUM (
    'active',
    'paused',
    'completed',
    'archived'
);


ALTER TYPE public.habit_status OWNER TO kan_user;

--
-- Name: habit_type; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.habit_type AS ENUM (
    'build',
    'remove'
);


ALTER TYPE public.habit_type OWNER TO kan_user;

--
-- Name: invite_link_status; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.invite_link_status AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.invite_link_status OWNER TO kan_user;

--
-- Name: member_status; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.member_status AS ENUM (
    'invited',
    'active',
    'removed',
    'paused'
);


ALTER TYPE public.member_status OWNER TO kan_user;

--
-- Name: permission_level; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.permission_level AS ENUM (
    'view',
    'edit',
    'admin'
);


ALTER TYPE public.permission_level OWNER TO kan_user;

--
-- Name: priority_level; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.priority_level AS ENUM (
    'critical',
    'high',
    'medium',
    'low'
);


ALTER TYPE public.priority_level OWNER TO kan_user;

--
-- Name: role; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.role AS ENUM (
    'admin',
    'member',
    'guest'
);


ALTER TYPE public.role OWNER TO kan_user;

--
-- Name: slug_type; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.slug_type AS ENUM (
    'reserved',
    'premium'
);


ALTER TYPE public.slug_type OWNER TO kan_user;

--
-- Name: source; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.source AS ENUM (
    'trello'
);


ALTER TYPE public.source OWNER TO kan_user;

--
-- Name: status; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.status AS ENUM (
    'started',
    'success',
    'failed'
);


ALTER TYPE public.status OWNER TO kan_user;

--
-- Name: time_entry_type; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.time_entry_type AS ENUM (
    'card',
    'goal',
    'habit',
    'document',
    'meeting',
    'other'
);


ALTER TYPE public.time_entry_type OWNER TO kan_user;

--
-- Name: tracking_type; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.tracking_type AS ENUM (
    'task',
    'count',
    'time'
);


ALTER TYPE public.tracking_type OWNER TO kan_user;

--
-- Name: workspace_plan; Type: TYPE; Schema: public; Owner: kan_user
--

CREATE TYPE public.workspace_plan AS ENUM (
    'free',
    'pro',
    'enterprise'
);


ALTER TYPE public.workspace_plan OWNER TO kan_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: kan_user
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO kan_user;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: kan_user
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO kan_user;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: kan_user
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: _card_labels; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public._card_labels (
    "cardId" bigint NOT NULL,
    "labelId" bigint NOT NULL
);


ALTER TABLE public._card_labels OWNER TO kan_user;

--
-- Name: _card_workspace_members; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public._card_workspace_members (
    "cardId" bigint NOT NULL,
    "workspaceMemberId" bigint NOT NULL
);


ALTER TABLE public._card_workspace_members OWNER TO kan_user;

--
-- Name: _goal_cards; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public._goal_cards (
    "goalId" bigint NOT NULL,
    "cardId" bigint NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public._goal_cards OWNER TO kan_user;

--
-- Name: _habit_cards; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public._habit_cards (
    "habitId" bigint NOT NULL,
    "cardId" bigint NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public._habit_cards OWNER TO kan_user;

--
-- Name: account; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.account (
    id bigint NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" uuid NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp without time zone,
    "refreshTokenExpiresAt" timestamp without time zone,
    scope text,
    password text,
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone NOT NULL
);


ALTER TABLE public.account OWNER TO kan_user;

--
-- Name: account_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.account_id_seq OWNER TO kan_user;

--
-- Name: account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.account_id_seq OWNED BY public.account.id;


--
-- Name: apiKey; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public."apiKey" (
    id bigint NOT NULL,
    name text,
    start text,
    prefix text,
    key text NOT NULL,
    "userId" uuid NOT NULL,
    "refillInterval" integer,
    "refillAmount" integer,
    "lastRefillAt" timestamp without time zone,
    enabled boolean,
    "rateLimitEnabled" boolean,
    "rateLimitTimeWindow" integer,
    "rateLimitMax" integer,
    "requestCount" integer,
    remaining integer,
    "lastRequest" timestamp without time zone,
    "expiresAt" timestamp without time zone,
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone NOT NULL,
    permissions text,
    metadata text
);


ALTER TABLE public."apiKey" OWNER TO kan_user;

--
-- Name: apiKey_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public."apiKey_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."apiKey_id_seq" OWNER TO kan_user;

--
-- Name: apiKey_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public."apiKey_id_seq" OWNED BY public."apiKey".id;


--
-- Name: board; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.board (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    slug character varying(255) NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    "deletedBy" uuid,
    "importId" bigint,
    "workspaceId" bigint NOT NULL,
    visibility public.board_visibility DEFAULT 'private'::public.board_visibility NOT NULL,
    type public.board_type DEFAULT 'regular'::public.board_type NOT NULL,
    "sourceBoardId" bigint,
    "coverImage" text
);


ALTER TABLE public.board OWNER TO kan_user;

--
-- Name: board_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.board_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.board_id_seq OWNER TO kan_user;

--
-- Name: board_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.board_id_seq OWNED BY public.board.id;


--
-- Name: card; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.card (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    index integer NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    "deletedBy" uuid,
    "listId" bigint NOT NULL,
    "importId" bigint
);


ALTER TABLE public.card OWNER TO kan_user;

--
-- Name: card_activity; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.card_activity (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    type public.card_activity_type NOT NULL,
    "cardId" bigint NOT NULL,
    "fromIndex" integer,
    "toIndex" integer,
    "fromListId" bigint,
    "toListId" bigint,
    "labelId" bigint,
    "workspaceMemberId" bigint,
    "fromTitle" character varying(255),
    "toTitle" character varying(255),
    "fromDescription" text,
    "toDescription" text,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "commentId" bigint,
    "fromComment" text,
    "toComment" text,
    "sourceBoardId" bigint
);


ALTER TABLE public.card_activity OWNER TO kan_user;

--
-- Name: card_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.card_activity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.card_activity_id_seq OWNER TO kan_user;

--
-- Name: card_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.card_activity_id_seq OWNED BY public.card_activity.id;


--
-- Name: card_checklist; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.card_checklist (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    name character varying(255) NOT NULL,
    index integer NOT NULL,
    "cardId" bigint NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    "deletedBy" uuid
);


ALTER TABLE public.card_checklist OWNER TO kan_user;

--
-- Name: card_checklist_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.card_checklist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.card_checklist_id_seq OWNER TO kan_user;

--
-- Name: card_checklist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.card_checklist_id_seq OWNED BY public.card_checklist.id;


--
-- Name: card_checklist_item; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.card_checklist_item (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    title character varying(500) NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    index integer NOT NULL,
    "checklistId" bigint NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    "deletedBy" uuid
);


ALTER TABLE public.card_checklist_item OWNER TO kan_user;

--
-- Name: card_checklist_item_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.card_checklist_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.card_checklist_item_id_seq OWNER TO kan_user;

--
-- Name: card_checklist_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.card_checklist_item_id_seq OWNED BY public.card_checklist_item.id;


--
-- Name: card_comments; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.card_comments (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    comment text NOT NULL,
    "cardId" bigint NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    "deletedBy" uuid
);


ALTER TABLE public.card_comments OWNER TO kan_user;

--
-- Name: card_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.card_comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.card_comments_id_seq OWNER TO kan_user;

--
-- Name: card_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.card_comments_id_seq OWNED BY public.card_comments.id;


--
-- Name: card_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.card_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.card_id_seq OWNER TO kan_user;

--
-- Name: card_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.card_id_seq OWNED BY public.card.id;


--
-- Name: card_time_estimate; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.card_time_estimate (
    id bigint NOT NULL,
    "cardId" bigint NOT NULL,
    "estimatedMinutes" integer NOT NULL,
    "actualMinutes" integer DEFAULT 0,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.card_time_estimate OWNER TO kan_user;

--
-- Name: card_time_estimate_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.card_time_estimate_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.card_time_estimate_id_seq OWNER TO kan_user;

--
-- Name: card_time_estimate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.card_time_estimate_id_seq OWNED BY public.card_time_estimate.id;


--
-- Name: feedback; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.feedback (
    id bigint NOT NULL,
    feedback text NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    url text NOT NULL,
    reviewed boolean DEFAULT false NOT NULL
);


ALTER TABLE public.feedback OWNER TO kan_user;

--
-- Name: feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feedback_id_seq OWNER TO kan_user;

--
-- Name: feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.feedback_id_seq OWNED BY public.feedback.id;


--
-- Name: file_collaborators; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.file_collaborators (
    id bigint NOT NULL,
    "fileId" bigint NOT NULL,
    "userId" uuid NOT NULL,
    "cursorPosition" jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastSeenAt" timestamp without time zone DEFAULT now() NOT NULL,
    "joinedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.file_collaborators OWNER TO kan_user;

--
-- Name: file_collaborators_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.file_collaborators_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_collaborators_id_seq OWNER TO kan_user;

--
-- Name: file_collaborators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.file_collaborators_id_seq OWNED BY public.file_collaborators.id;


--
-- Name: file_shares; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.file_shares (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    "fileId" bigint NOT NULL,
    "userId" uuid,
    email character varying(255),
    permission public.permission_level DEFAULT 'view'::public.permission_level NOT NULL,
    "expiresAt" timestamp without time zone,
    "sharedBy" uuid NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "revokedAt" timestamp without time zone,
    "revokedBy" uuid
);


ALTER TABLE public.file_shares OWNER TO kan_user;

--
-- Name: file_shares_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.file_shares_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_shares_id_seq OWNER TO kan_user;

--
-- Name: file_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.file_shares_id_seq OWNED BY public.file_shares.id;


--
-- Name: file_versions; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.file_versions (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    "fileId" bigint NOT NULL,
    content text NOT NULL,
    "contentCompressed" text,
    "versionNumber" bigint NOT NULL,
    "changeDescription" text,
    "createdBy" uuid NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.file_versions OWNER TO kan_user;

--
-- Name: file_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.file_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_versions_id_seq OWNER TO kan_user;

--
-- Name: file_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.file_versions_id_seq OWNED BY public.file_versions.id;


--
-- Name: files; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.files (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    name character varying(255) NOT NULL,
    type text NOT NULL,
    content text,
    "contentCompressed" text,
    metadata jsonb,
    "folderId" bigint,
    "workspaceId" bigint NOT NULL,
    index bigint DEFAULT 0 NOT NULL,
    "isTemplate" boolean DEFAULT false NOT NULL,
    "templateCategory" character varying(100),
    "createdBy" uuid NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    "deletedBy" uuid,
    "thumbnailS3Key" character varying(500),
    "thumbnailS3Url" character varying(1000),
    "isCompressed" boolean DEFAULT false,
    "shareToken" character varying(64),
    "shareExpiresAt" timestamp without time zone,
    "isPublicShare" boolean DEFAULT false
);


ALTER TABLE public.files OWNER TO kan_user;

--
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.files_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.files_id_seq OWNER TO kan_user;

--
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.files_id_seq OWNED BY public.files.id;


--
-- Name: folders; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.folders (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    name character varying(255) NOT NULL,
    "parentId" bigint,
    "workspaceId" bigint NOT NULL,
    "isExpanded" boolean DEFAULT false NOT NULL,
    index bigint DEFAULT 0 NOT NULL,
    "createdBy" uuid NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    "deletedBy" uuid,
    color character varying(7)
);


ALTER TABLE public.folders OWNER TO kan_user;

--
-- Name: folders_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.folders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.folders_id_seq OWNER TO kan_user;

--
-- Name: folders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.folders_id_seq OWNED BY public.folders.id;


--
-- Name: goal; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.goal (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    "workspaceId" bigint NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "goalType" public.goal_type DEFAULT 'personal'::public.goal_type NOT NULL,
    timeframe public.goal_timeframe DEFAULT 'monthly'::public.goal_timeframe NOT NULL,
    status public.goal_status DEFAULT 'not_started'::public.goal_status NOT NULL,
    priority public.priority_level DEFAULT 'medium'::public.priority_level NOT NULL,
    "startDate" timestamp without time zone,
    "targetDate" timestamp without time zone,
    "completedDate" timestamp without time zone,
    progress integer DEFAULT 0 NOT NULL,
    metrics jsonb,
    "parentGoalId" bigint,
    "linkedBoardId" bigint,
    tags jsonb DEFAULT '[]'::jsonb,
    "isArchived" boolean DEFAULT false NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    "deletedBy" uuid
);


ALTER TABLE public.goal OWNER TO kan_user;

--
-- Name: goal_activity; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.goal_activity (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    type public.goal_activity_type NOT NULL,
    "goalId" bigint NOT NULL,
    metadata jsonb,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.goal_activity OWNER TO kan_user;

--
-- Name: goal_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.goal_activity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.goal_activity_id_seq OWNER TO kan_user;

--
-- Name: goal_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.goal_activity_id_seq OWNED BY public.goal_activity.id;


--
-- Name: goal_check_in; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.goal_check_in (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    "goalId" bigint NOT NULL,
    progress integer NOT NULL,
    notes text,
    mood character varying(50),
    blockers text,
    wins text,
    "nextSteps" text,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.goal_check_in OWNER TO kan_user;

--
-- Name: goal_check_in_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.goal_check_in_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.goal_check_in_id_seq OWNER TO kan_user;

--
-- Name: goal_check_in_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.goal_check_in_id_seq OWNED BY public.goal_check_in.id;


--
-- Name: goal_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.goal_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.goal_id_seq OWNER TO kan_user;

--
-- Name: goal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.goal_id_seq OWNED BY public.goal.id;


--
-- Name: goal_milestone; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.goal_milestone (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    "goalId" bigint NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "targetDate" timestamp without time zone,
    "completedDate" timestamp without time zone,
    index integer DEFAULT 0 NOT NULL,
    "linkedCardId" bigint,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.goal_milestone OWNER TO kan_user;

--
-- Name: goal_milestone_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.goal_milestone_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.goal_milestone_id_seq OWNER TO kan_user;

--
-- Name: goal_milestone_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.goal_milestone_id_seq OWNED BY public.goal_milestone.id;


--
-- Name: habit; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.habit (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    "workspaceId" bigint NOT NULL,
    "userId" uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    category public.habit_category DEFAULT 'other'::public.habit_category NOT NULL,
    frequency public.habit_frequency DEFAULT 'daily'::public.habit_frequency NOT NULL,
    "frequencyDetails" jsonb,
    "streakCount" integer DEFAULT 0 NOT NULL,
    "longestStreak" integer DEFAULT 0 NOT NULL,
    "totalCompletions" integer DEFAULT 0 NOT NULL,
    "reminderTime" time without time zone,
    "reminderEnabled" boolean DEFAULT false NOT NULL,
    "linkedGoalId" bigint,
    status public.habit_status DEFAULT 'active'::public.habit_status NOT NULL,
    color character varying(7) DEFAULT '#FDB022'::character varying,
    icon character varying(50),
    "targetCount" integer DEFAULT 1,
    unit character varying(50),
    "isPublic" boolean DEFAULT false NOT NULL,
    tags jsonb DEFAULT '[]'::jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    "habitType" public.habit_type DEFAULT 'build'::public.habit_type NOT NULL,
    "trackingType" public.tracking_type DEFAULT 'task'::public.tracking_type NOT NULL,
    reminders jsonb DEFAULT '[]'::jsonb,
    "scheduleStart" timestamp without time zone DEFAULT now(),
    "scheduleEnd" timestamp without time zone
);


ALTER TABLE public.habit OWNER TO kan_user;

--
-- Name: habit_completion; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.habit_completion (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    "habitId" bigint NOT NULL,
    "completedAt" timestamp without time zone DEFAULT now() NOT NULL,
    count integer DEFAULT 1 NOT NULL,
    notes text,
    mood character varying(50),
    "linkedCardId" bigint,
    "createdBy" uuid
);


ALTER TABLE public.habit_completion OWNER TO kan_user;

--
-- Name: habit_completion_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.habit_completion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.habit_completion_id_seq OWNER TO kan_user;

--
-- Name: habit_completion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.habit_completion_id_seq OWNED BY public.habit_completion.id;


--
-- Name: habit_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.habit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.habit_id_seq OWNER TO kan_user;

--
-- Name: habit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.habit_id_seq OWNED BY public.habit.id;


--
-- Name: habit_note; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.habit_note (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    "habitId" bigint NOT NULL,
    date timestamp without time zone NOT NULL,
    note text NOT NULL,
    mood character varying(50),
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.habit_note OWNER TO kan_user;

--
-- Name: habit_note_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.habit_note_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.habit_note_id_seq OWNER TO kan_user;

--
-- Name: habit_note_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.habit_note_id_seq OWNED BY public.habit_note.id;


--
-- Name: habit_template; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.habit_template (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category public.habit_category NOT NULL,
    frequency public.habit_frequency NOT NULL,
    "frequencyDetails" jsonb,
    icon character varying(50),
    color character varying(7),
    "targetCount" integer DEFAULT 1,
    unit character varying(50),
    "isPublic" boolean DEFAULT true NOT NULL,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.habit_template OWNER TO kan_user;

--
-- Name: habit_template_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.habit_template_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.habit_template_id_seq OWNER TO kan_user;

--
-- Name: habit_template_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.habit_template_id_seq OWNED BY public.habit_template.id;


--
-- Name: import; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.import (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    source public.source NOT NULL,
    status public.status NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.import OWNER TO kan_user;

--
-- Name: import_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.import_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.import_id_seq OWNER TO kan_user;

--
-- Name: import_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.import_id_seq OWNED BY public.import.id;


--
-- Name: integration; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.integration (
    provider character varying(255) NOT NULL,
    "userId" uuid NOT NULL,
    "accessToken" character varying(255) NOT NULL,
    "refreshToken" character varying(255),
    "expiresAt" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.integration OWNER TO kan_user;

--
-- Name: label; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.label (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    name character varying(255) NOT NULL,
    "colourCode" character varying(12),
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "boardId" bigint NOT NULL,
    "importId" bigint,
    "deletedAt" timestamp without time zone,
    "deletedBy" uuid
);


ALTER TABLE public.label OWNER TO kan_user;

--
-- Name: label_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.label_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.label_id_seq OWNER TO kan_user;

--
-- Name: label_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.label_id_seq OWNED BY public.label.id;


--
-- Name: list; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.list (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    name character varying(255) NOT NULL,
    index integer NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    "deletedBy" uuid,
    "boardId" bigint NOT NULL,
    "importId" bigint
);


ALTER TABLE public.list OWNER TO kan_user;

--
-- Name: list_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.list_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.list_id_seq OWNER TO kan_user;

--
-- Name: list_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.list_id_seq OWNED BY public.list.id;


--
-- Name: pomodoro_session; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.pomodoro_session (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    "workspaceId" bigint NOT NULL,
    "userId" uuid NOT NULL,
    "cardId" bigint,
    duration integer DEFAULT 1500 NOT NULL,
    "breakDuration" integer DEFAULT 300 NOT NULL,
    "completedPomodoros" integer DEFAULT 0 NOT NULL,
    "targetPomodoros" integer DEFAULT 4 NOT NULL,
    "startTime" timestamp without time zone NOT NULL,
    "endTime" timestamp without time zone,
    "isCompleted" boolean DEFAULT false NOT NULL,
    notes text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pomodoro_session OWNER TO kan_user;

--
-- Name: pomodoro_session_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.pomodoro_session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pomodoro_session_id_seq OWNER TO kan_user;

--
-- Name: pomodoro_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.pomodoro_session_id_seq OWNED BY public.pomodoro_session.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.session (
    id bigint NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" uuid NOT NULL
);


ALTER TABLE public.session OWNER TO kan_user;

--
-- Name: session_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.session_id_seq OWNER TO kan_user;

--
-- Name: session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.session_id_seq OWNED BY public.session.id;


--
-- Name: subscription; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.subscription (
    id bigint NOT NULL,
    plan character varying(255) NOT NULL,
    "referenceId" character varying(12),
    "stripeCustomerId" character varying(255),
    "stripeSubscriptionId" character varying(255),
    status character varying(255) NOT NULL,
    "periodStart" timestamp without time zone,
    "periodEnd" timestamp without time zone,
    "cancelAtPeriodEnd" boolean,
    seats integer,
    "trialStart" timestamp without time zone,
    "trialEnd" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "unlimitedSeats" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.subscription OWNER TO kan_user;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscription_id_seq OWNER TO kan_user;

--
-- Name: subscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.subscription_id_seq OWNED BY public.subscription.id;


--
-- Name: time_block; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.time_block (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    "workspaceId" bigint NOT NULL,
    "userId" uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "startTime" timestamp without time zone NOT NULL,
    "endTime" timestamp without time zone NOT NULL,
    "cardId" bigint,
    "goalId" bigint,
    color character varying(7) DEFAULT '#3b82f6'::character varying,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "recurrenceRule" jsonb,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public.time_block OWNER TO kan_user;

--
-- Name: time_block_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.time_block_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.time_block_id_seq OWNER TO kan_user;

--
-- Name: time_block_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.time_block_id_seq OWNED BY public.time_block.id;


--
-- Name: time_entry; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.time_entry (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    "workspaceId" bigint NOT NULL,
    "userId" uuid NOT NULL,
    type public.time_entry_type NOT NULL,
    description text,
    "startTime" timestamp without time zone NOT NULL,
    "endTime" timestamp without time zone,
    duration integer,
    "isBillable" boolean DEFAULT false NOT NULL,
    "hourlyRate" integer,
    "cardId" bigint,
    "goalId" bigint,
    "habitId" bigint,
    tags jsonb DEFAULT '[]'::jsonb,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public.time_entry OWNER TO kan_user;

--
-- Name: time_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.time_entry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.time_entry_id_seq OWNER TO kan_user;

--
-- Name: time_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.time_entry_id_seq OWNED BY public.time_entry.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255),
    email character varying(255) NOT NULL,
    "emailVerified" boolean NOT NULL,
    image character varying(255),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "stripeCustomerId" character varying(255)
);


ALTER TABLE public."user" OWNER TO kan_user;

--
-- Name: verification; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.verification (
    id bigint NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.verification OWNER TO kan_user;

--
-- Name: verification_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.verification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.verification_id_seq OWNER TO kan_user;

--
-- Name: verification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.verification_id_seq OWNED BY public.verification.id;


--
-- Name: workspace; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.workspace (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    slug character varying(255) NOT NULL,
    plan public.workspace_plan DEFAULT 'free'::public.workspace_plan NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    "deletedBy" uuid
);


ALTER TABLE public.workspace OWNER TO kan_user;

--
-- Name: workspace_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.workspace_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workspace_id_seq OWNER TO kan_user;

--
-- Name: workspace_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.workspace_id_seq OWNED BY public.workspace.id;


--
-- Name: workspace_invite_links; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.workspace_invite_links (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    "workspaceId" bigint NOT NULL,
    code character varying(12) NOT NULL,
    status public.invite_link_status DEFAULT 'active'::public.invite_link_status NOT NULL,
    "expiresAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "createdBy" uuid,
    "updatedAt" timestamp without time zone,
    "updatedBy" uuid
);


ALTER TABLE public.workspace_invite_links OWNER TO kan_user;

--
-- Name: workspace_invite_links_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.workspace_invite_links_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workspace_invite_links_id_seq OWNER TO kan_user;

--
-- Name: workspace_invite_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.workspace_invite_links_id_seq OWNED BY public.workspace_invite_links.id;


--
-- Name: workspace_members; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.workspace_members (
    id bigint NOT NULL,
    "publicId" character varying(12) NOT NULL,
    "userId" uuid,
    "workspaceId" bigint NOT NULL,
    "createdBy" uuid NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone,
    "deletedAt" timestamp without time zone,
    "deletedBy" uuid,
    role public.role NOT NULL,
    status public.member_status DEFAULT 'invited'::public.member_status NOT NULL,
    email character varying(255) NOT NULL
);


ALTER TABLE public.workspace_members OWNER TO kan_user;

--
-- Name: workspace_members_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.workspace_members_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workspace_members_id_seq OWNER TO kan_user;

--
-- Name: workspace_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.workspace_members_id_seq OWNED BY public.workspace_members.id;


--
-- Name: workspace_slug_checks; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.workspace_slug_checks (
    id bigint NOT NULL,
    slug character varying(255) NOT NULL,
    available boolean NOT NULL,
    reserved boolean NOT NULL,
    "workspaceId" bigint,
    "createdBy" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.workspace_slug_checks OWNER TO kan_user;

--
-- Name: workspace_slug_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: kan_user
--

CREATE SEQUENCE public.workspace_slug_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workspace_slug_checks_id_seq OWNER TO kan_user;

--
-- Name: workspace_slug_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kan_user
--

ALTER SEQUENCE public.workspace_slug_checks_id_seq OWNED BY public.workspace_slug_checks.id;


--
-- Name: workspace_slugs; Type: TABLE; Schema: public; Owner: kan_user
--

CREATE TABLE public.workspace_slugs (
    slug character varying(255) NOT NULL,
    type public.slug_type NOT NULL
);


ALTER TABLE public.workspace_slugs OWNER TO kan_user;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: kan_user
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: account id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.account ALTER COLUMN id SET DEFAULT nextval('public.account_id_seq'::regclass);


--
-- Name: apiKey id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public."apiKey" ALTER COLUMN id SET DEFAULT nextval('public."apiKey_id_seq"'::regclass);


--
-- Name: board id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.board ALTER COLUMN id SET DEFAULT nextval('public.board_id_seq'::regclass);


--
-- Name: card id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card ALTER COLUMN id SET DEFAULT nextval('public.card_id_seq'::regclass);


--
-- Name: card_activity id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_activity ALTER COLUMN id SET DEFAULT nextval('public.card_activity_id_seq'::regclass);


--
-- Name: card_checklist id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_checklist ALTER COLUMN id SET DEFAULT nextval('public.card_checklist_id_seq'::regclass);


--
-- Name: card_checklist_item id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_checklist_item ALTER COLUMN id SET DEFAULT nextval('public.card_checklist_item_id_seq'::regclass);


--
-- Name: card_comments id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_comments ALTER COLUMN id SET DEFAULT nextval('public.card_comments_id_seq'::regclass);


--
-- Name: card_time_estimate id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_time_estimate ALTER COLUMN id SET DEFAULT nextval('public.card_time_estimate_id_seq'::regclass);


--
-- Name: feedback id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.feedback ALTER COLUMN id SET DEFAULT nextval('public.feedback_id_seq'::regclass);


--
-- Name: file_collaborators id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_collaborators ALTER COLUMN id SET DEFAULT nextval('public.file_collaborators_id_seq'::regclass);


--
-- Name: file_shares id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_shares ALTER COLUMN id SET DEFAULT nextval('public.file_shares_id_seq'::regclass);


--
-- Name: file_versions id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_versions ALTER COLUMN id SET DEFAULT nextval('public.file_versions_id_seq'::regclass);


--
-- Name: files id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- Name: folders id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.folders ALTER COLUMN id SET DEFAULT nextval('public.folders_id_seq'::regclass);


--
-- Name: goal id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal ALTER COLUMN id SET DEFAULT nextval('public.goal_id_seq'::regclass);


--
-- Name: goal_activity id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_activity ALTER COLUMN id SET DEFAULT nextval('public.goal_activity_id_seq'::regclass);


--
-- Name: goal_check_in id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_check_in ALTER COLUMN id SET DEFAULT nextval('public.goal_check_in_id_seq'::regclass);


--
-- Name: goal_milestone id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_milestone ALTER COLUMN id SET DEFAULT nextval('public.goal_milestone_id_seq'::regclass);


--
-- Name: habit id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit ALTER COLUMN id SET DEFAULT nextval('public.habit_id_seq'::regclass);


--
-- Name: habit_completion id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_completion ALTER COLUMN id SET DEFAULT nextval('public.habit_completion_id_seq'::regclass);


--
-- Name: habit_note id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_note ALTER COLUMN id SET DEFAULT nextval('public.habit_note_id_seq'::regclass);


--
-- Name: habit_template id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_template ALTER COLUMN id SET DEFAULT nextval('public.habit_template_id_seq'::regclass);


--
-- Name: import id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.import ALTER COLUMN id SET DEFAULT nextval('public.import_id_seq'::regclass);


--
-- Name: label id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.label ALTER COLUMN id SET DEFAULT nextval('public.label_id_seq'::regclass);


--
-- Name: list id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.list ALTER COLUMN id SET DEFAULT nextval('public.list_id_seq'::regclass);


--
-- Name: pomodoro_session id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.pomodoro_session ALTER COLUMN id SET DEFAULT nextval('public.pomodoro_session_id_seq'::regclass);


--
-- Name: session id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.session ALTER COLUMN id SET DEFAULT nextval('public.session_id_seq'::regclass);


--
-- Name: subscription id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.subscription ALTER COLUMN id SET DEFAULT nextval('public.subscription_id_seq'::regclass);


--
-- Name: time_block id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_block ALTER COLUMN id SET DEFAULT nextval('public.time_block_id_seq'::regclass);


--
-- Name: time_entry id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_entry ALTER COLUMN id SET DEFAULT nextval('public.time_entry_id_seq'::regclass);


--
-- Name: verification id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.verification ALTER COLUMN id SET DEFAULT nextval('public.verification_id_seq'::regclass);


--
-- Name: workspace id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace ALTER COLUMN id SET DEFAULT nextval('public.workspace_id_seq'::regclass);


--
-- Name: workspace_invite_links id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_invite_links ALTER COLUMN id SET DEFAULT nextval('public.workspace_invite_links_id_seq'::regclass);


--
-- Name: workspace_members id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_members ALTER COLUMN id SET DEFAULT nextval('public.workspace_members_id_seq'::regclass);


--
-- Name: workspace_slug_checks id; Type: DEFAULT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_slug_checks ALTER COLUMN id SET DEFAULT nextval('public.workspace_slug_checks_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: kan_user
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	cd64e5a0695ab995fdcc289ae96be2a738135a42952e421bcefe10fd6af5821d	1746693478656
2	8028f3179e860d600700a193618b6342938b381678929bf6209719784f9076d9	1747903068807
3	0b142fa56d4a93a09716230070a660eb303bb55f8ec0624e0d6bd869b83c9ce0	1748378293342
4	ba306737772aa239e53b0bf68a2337eef2807006a53b4ebab67004847d52bbd1	1749118315675
5	e727f544771c59d88f88bd77197b0ed1f3de6a4fda6303841fc24074b8d4ebc0	1749405288761
6	ca86e4dae68887af8969e8577aa6bc981f29538435bdf02173218c5ceeab9d1b	1749377372062
7	7633ab18f551298ce839a20fa7c166fd678f3fe7c9e0e71bd253a9ae748f3d6d	1749585889984
8	5d5a67f07f8eafba0fe48121623823ab9889eeba1fc016d5b4526862ebe1dbfd	1754511666265
9	8b2f62cd5a2a1d62c0ba3b7a71ff92f3f9ac211c2130d2aa0e950b7489dca72c	1755094668761
10	b04eb472e7149489e1355ae2ef8c0eaf108098ebde9cb31b88fb5dd8a44341ce	1756803246096
11	869b1b5ac07f997b6bde34fe17aa721dd10220accc89e01c35c0f6106c18dc9a	1757271312974
12	19aa559d7191fae1384e009170c446309e0ee7c12bf29d825288c6a1156e8148	1757533858687
13	1f774093cf740d93dc2b74f606596663eb1d708ef3ef61180b2d1c0f92a7e243	1757534656098
14	6e05745f1c6d85e34d9545356c429d23ab7643c797d7a90669f218125c0c6d4b	1757535838766
15	f85e97fa48dbe0508f647f51c46824f67de0d5dedca2572dad1f3c2bacf3dea8	1758226671081
16	fdf0c1ea179a8841e1510620e955295fa2d8e03cc28776e08e7a537ff1ff6bc5	1758662398166
17	60766c131faa5188b07a04c54f1c7f24d94250ca4b23102bd250ca39e5d3d2fb	1759356096392
18	698e72d74d0137e30eea82f4dc93963134c09c82f62887498fd9c32460e6f45d	1759869689304
19	b940b3945f1be8d1b3a9cf237b36ee99747cd063698a96510710dae62b7bc42f	1760044396109
20	565f6d5a75ab3e56b3c88f3ae05bccb11223c9478d8d92eff07ac4cae38f8c57	1763066579221
\.


--
-- Data for Name: _card_labels; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public._card_labels ("cardId", "labelId") FROM stdin;
\.


--
-- Data for Name: _card_workspace_members; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public._card_workspace_members ("cardId", "workspaceMemberId") FROM stdin;
\.


--
-- Data for Name: _goal_cards; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public._goal_cards ("goalId", "cardId", "createdAt") FROM stdin;
\.


--
-- Data for Name: _habit_cards; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public._habit_cards ("habitId", "cardId", "createdAt") FROM stdin;
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
1	753536dc-ccc7-4855-b1ec-74ee55738568	credential	753536dc-ccc7-4855-b1ec-74ee55738568	\N	\N	\N	\N	\N	\N	e54b874b08ffc430bf80597500db78da:1df1ed1ce34f196d6679b302e98db8baacf024c1ef86b23316e16ebc8adcb1b4ab4b05a63fe4d656c55160f0a27e928d69e6952cb4a02cd0d259cb65d8a54bb8	2025-11-11 17:29:37.886	2025-11-11 17:29:37.886
2	63c29493-26c3-4f09-9575-9bd5000726e4	credential	63c29493-26c3-4f09-9575-9bd5000726e4	\N	\N	\N	\N	\N	\N	c9c2797975ef4db31271e8b2d6aa0750:dc20e9e9eed7baa6ddaea62bd32ec6f7879d137b0c2765ae5bba785eee8935e41a641c484c35d780fc844bf3dfc440e9343eeb8e8d192289cc9bafbfc65725ce	2025-11-12 00:18:31.294	2025-11-12 00:18:31.294
3	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	credential	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	\N	\N	\N	\N	\N	\N	c982f6858960a68ee39be9a5db236f7b:94aecf1a14591da181c5231d3f373294c3790c50e051cd3a76ab84706b736ff471ea60f76760f1c0af3b44275b34fe373812b3d064c2fa11866b95b322439713	2025-11-12 00:58:06.176	2025-11-12 00:58:06.176
\.


--
-- Data for Name: apiKey; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public."apiKey" (id, name, start, prefix, key, "userId", "refillInterval", "refillAmount", "lastRefillAt", enabled, "rateLimitEnabled", "rateLimitTimeWindow", "rateLimitMax", "requestCount", remaining, "lastRequest", "expiresAt", "createdAt", "updatedAt", permissions, metadata) FROM stdin;
\.


--
-- Data for Name: board; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.board (id, "publicId", name, description, slug, "createdBy", "createdAt", "updatedAt", "deletedAt", "deletedBy", "importId", "workspaceId", visibility, type, "sourceBoardId", "coverImage") FROM stdin;
8	9rguemts6ksd	My Villa	\N	my-villa-x0sh15z35bjn	753536dc-ccc7-4855-b1ec-74ee55738568	2025-11-11 21:28:40.108381	\N	\N	\N	\N	2	private	template	\N	\N
9	199ed8kam4k0	My Villa	\N	my-villa	753536dc-ccc7-4855-b1ec-74ee55738568	2025-11-11 22:08:10.646799	\N	\N	\N	\N	2	private	regular	\N	\N
10	tqdpfg82jbp5	sfsdaf	\N	sfsdaf-xoamv9este6l	753536dc-ccc7-4855-b1ec-74ee55738568	2025-11-12 00:02:57.124461	\N	\N	\N	\N	2	private	template	\N	https://source.unsplash.com/800x400/?sfsdaf,abstract,minimal
11	q3ruhnaf4xsk	sfsdfsdf	\N	sfsdfsdf	753536dc-ccc7-4855-b1ec-74ee55738568	2025-11-12 00:03:06.53909	\N	\N	\N	\N	2	private	regular	\N	https://source.unsplash.com/800x400/?sfsdfsdf,abstract,minimal
120	l708it3hu439	My Villa	\N	my-villa	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 09:50:15.838272	2025-11-13 17:59:16.569	\N	\N	\N	5	public	regular	\N	https://picsum.photos/id/388/400/200
\.


--
-- Data for Name: card; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.card (id, "publicId", title, description, index, "createdBy", "createdAt", "updatedAt", "deletedAt", "deletedBy", "listId", "importId") FROM stdin;
\.


--
-- Data for Name: card_activity; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.card_activity (id, "publicId", type, "cardId", "fromIndex", "toIndex", "fromListId", "toListId", "labelId", "workspaceMemberId", "fromTitle", "toTitle", "fromDescription", "toDescription", "createdBy", "createdAt", "commentId", "fromComment", "toComment", "sourceBoardId") FROM stdin;
\.


--
-- Data for Name: card_checklist; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.card_checklist (id, "publicId", name, index, "cardId", "createdBy", "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
\.


--
-- Data for Name: card_checklist_item; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.card_checklist_item (id, "publicId", title, completed, index, "checklistId", "createdBy", "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
\.


--
-- Data for Name: card_comments; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.card_comments (id, "publicId", comment, "cardId", "createdBy", "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
\.


--
-- Data for Name: card_time_estimate; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.card_time_estimate (id, "cardId", "estimatedMinutes", "actualMinutes", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.feedback (id, feedback, "createdBy", "createdAt", "updatedAt", url, reviewed) FROM stdin;
\.


--
-- Data for Name: file_collaborators; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.file_collaborators (id, "fileId", "userId", "cursorPosition", "isActive", "lastSeenAt", "joinedAt") FROM stdin;
\.


--
-- Data for Name: file_shares; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.file_shares (id, "publicId", "fileId", "userId", email, permission, "expiresAt", "sharedBy", "createdAt", "revokedAt", "revokedBy") FROM stdin;
\.


--
-- Data for Name: file_versions; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.file_versions (id, "publicId", "fileId", content, "contentCompressed", "versionNumber", "changeDescription", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.files (id, "publicId", name, type, content, "contentCompressed", metadata, "folderId", "workspaceId", index, "isTemplate", "templateCategory", "createdBy", "createdAt", "updatedAt", "deletedAt", "deletedBy", "thumbnailS3Key", "thumbnailS3Url", "isCompressed", "shareToken", "shareExpiresAt", "isPublicShare") FROM stdin;
1	1nij3uwcr1e9	Untitled Document	docx	<ol><li><p>This is just a test to see if this works<strong>asdfasdfsdfasdf<em>fsdfasdfsadfsdasdfsdfsdf</em></strong></p></li></ol>	\N	\N	\N	4	0	f	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 06:52:39.695191	2025-11-13 07:09:22.052	\N	\N	\N	\N	f	\N	\N	f
2	da2mt9jn78o1	Untitled Markdown	md	#yep\n	\N	\N	\N	4	0	f	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 07:02:19.262713	2025-11-13 07:09:35.207	\N	\N	\N	\N	f	\N	\N	f
3	i4kyxav6xm47	Untitled Text File	txt	This is just a text files	\N	\N	\N	4	0	f	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 07:02:22.803625	2025-11-13 07:09:50.107	\N	\N	\N	\N	f	\N	\N	f
4	0vogoxtpf4u3	Untitled Spreadsheet	xlsx	[[{"value":"1"},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""}],[{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""}],[{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""}],[{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""}],[{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""}],[{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""}],[{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""}],[{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""}],[{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""}],[{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""},{"value":""}]]	\N	\N	\N	4	0	f	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 07:02:25.998669	2025-11-13 07:10:05.709	\N	\N	\N	\N	f	\N	\N	f
6	xw5zpga6tdbu	stuff	md	sdafasdfsdfasdfsdfsdsaf\nadsajf;askldjf sdfsd	\N	\N	1	4	0	f	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 07:11:34.724995	2025-11-13 07:11:54.367	\N	\N	\N	\N	f	\N	\N	f
7	o9cq4rm15vim	reasons	docx	<p>sdfasdfasd</p>	\N	\N	1	4	0	f	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 07:31:40.466149	2025-11-13 07:32:28.394	\N	\N	\N	\N	f	\N	\N	f
8	4cz090k6k8cv	brad	docx	<p>asdfasdf</p>	\N	\N	1	4	0	f	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 07:32:43.160506	2025-11-13 07:32:46.299	\N	\N	\N	\N	f	\N	\N	f
5	c0o0fkx19yof	Untitled Document	docx	<p></p>	\N	\N	1	4	0	f	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 07:10:38.426543	2025-11-13 07:57:31.239	\N	\N	\N	\N	f	\N	\N	f
9	m70atny0br4v	Untitled List	list	\N	\N	\N	1	4	0	f	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 08:02:13.606851	\N	\N	\N	\N	\N	f	\N	\N	f
10	smy2zss7z59k	Untitled List	list	\N	\N	\N	\N	4	0	f	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 08:15:32.046878	\N	\N	\N	\N	\N	f	\N	\N	f
14	df6ugfnk9nm8	Doctor	docx	<p>/</p>	\N	\N	\N	5	0	f	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 09:56:57.196792	2025-11-13 09:57:05.347	\N	\N	\N	\N	f	\N	\N	f
15	uu8eidtg53rj	Untitled Document	docx	<p>/</p><div class="iframe-wrapper"><iframe class="iframe-wrapper" src="https://purple.com/" width="100%" height="400" frameborder="0" allowfullscreen="true"></iframe></div><p></p>	\N	\N	6	5	0	f	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 10:17:38.016478	2025-11-13 10:19:29.546	\N	\N	\N	\N	f	\N	\N	f
\.


--
-- Data for Name: folders; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.folders (id, "publicId", name, "parentId", "workspaceId", "isExpanded", index, "createdBy", "createdAt", "updatedAt", "deletedAt", "deletedBy", color) FROM stdin;
5	jzncsagwah96	cvbnm,,l	\N	4	t	0	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 09:16:50.338746	2025-11-14 04:33:47.071	\N	\N	#6B7280
6	gpcd0zfgzc82	New Foldergghgg	\N	5	t	0	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 10:17:22.127688	2025-11-14 06:37:41.89	\N	\N	#6B7280
1	tpqon07h1chp	tools	\N	4	f	0	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 06:52:18.066125	2025-11-13 08:03:00.24	2025-11-13 08:03:04.11	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	#6B7280
2	evlulnpgpu66	New Folder	\N	4	t	1	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 06:52:22.467129	2025-11-13 07:32:37.288	2025-11-13 08:03:07.4	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	#6B7280
\.


--
-- Data for Name: goal; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.goal (id, "publicId", "workspaceId", title, description, "goalType", timeframe, status, priority, "startDate", "targetDate", "completedDate", progress, metrics, "parentGoalId", "linkedBoardId", tags, "isArchived", "createdBy", "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
\.


--
-- Data for Name: goal_activity; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.goal_activity (id, "publicId", type, "goalId", metadata, "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: goal_check_in; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.goal_check_in (id, "publicId", "goalId", progress, notes, mood, blockers, wins, "nextSteps", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: goal_milestone; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.goal_milestone (id, "publicId", "goalId", title, description, "targetDate", "completedDate", index, "linkedCardId", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: habit; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.habit (id, "publicId", "workspaceId", "userId", title, description, category, frequency, "frequencyDetails", "streakCount", "longestStreak", "totalCompletions", "reminderTime", "reminderEnabled", "linkedGoalId", status, color, icon, "targetCount", unit, "isPublic", tags, "createdAt", "updatedAt", "deletedAt", "habitType", "trackingType", reminders, "scheduleStart", "scheduleEnd") FROM stdin;
1	g5uf4m9sk3xm	5	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	dsf	sdfsdf	learning	weekly	\N	1	1	22	\N	f	\N	active	#3b82f6		1		f	[]	2025-11-13 22:01:53.931356	2025-11-13 22:02:06.463	2025-11-13 23:54:46.339	build	task	[]	2025-11-14 01:01:15.084937	\N
2	jm9yhfop3h5x	4	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	Tre Tech	\N	physical_mastery	times_per_month	{"count": 1, "excludedDates": []}	0	0	0	\N	f	\N	active	#F9E79F	TbPlane	1	\N	f	[]	2025-11-14 03:34:11.687775	\N	2025-11-14 19:07:53.894	build	task	[]	2025-11-14 03:34:11.687775	\N
\.


--
-- Data for Name: habit_completion; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.habit_completion (id, "publicId", "habitId", "completedAt", count, notes, mood, "linkedCardId", "createdBy") FROM stdin;
1	gj3cz7rnfhko	1	2025-11-13 22:01:59.66204	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
2	044ybxd6f9ag	1	2025-11-13 22:02:00.655194	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
3	lnalufymban3	1	2025-11-13 22:02:01.724964	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
4	rvw99jqr0tbb	1	2025-11-13 22:02:02.266102	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
5	4xwdsdk8gqxj	1	2025-11-13 22:02:02.483146	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
6	337a9gebt53i	1	2025-11-13 22:02:02.650876	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
7	ewcfif4flhf4	1	2025-11-13 22:02:02.792071	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
8	obguc9mfrfv8	1	2025-11-13 22:02:02.950596	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
9	tium4g9mkso1	1	2025-11-13 22:02:03.117814	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
10	4qsusnk8rxoq	1	2025-11-13 22:02:03.26748	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
11	xi6kdcygkxqq	1	2025-11-13 22:02:03.416285	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
12	s4dbqw5z3tgb	1	2025-11-13 22:02:03.614714	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
13	j8x3h9iqhvjq	1	2025-11-13 22:02:03.729658	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
14	t7dmedj9v0x9	1	2025-11-13 22:02:03.887504	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
15	7yw81sksogbz	1	2025-11-13 22:02:04.06568	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
16	rvd3mi8lgp3w	1	2025-11-13 22:02:04.224634	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
17	g4yt5iuimksh	1	2025-11-13 22:02:05.632905	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
18	383wqqj127hm	1	2025-11-13 22:02:05.820819	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
19	bl2ktw4v8za8	1	2025-11-13 22:02:05.982143	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
20	1ugea9h2od9q	1	2025-11-13 22:02:06.165727	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
21	2o0k0hsl4tug	1	2025-11-13 22:02:06.299148	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
22	ui952r40tudr	1	2025-11-13 22:02:06.457367	1	\N	\N	\N	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
\.


--
-- Data for Name: habit_note; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.habit_note (id, "publicId", "habitId", date, note, mood, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: habit_template; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.habit_template (id, "publicId", name, description, category, frequency, "frequencyDetails", icon, color, "targetCount", unit, "isPublic", "usageCount", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: import; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.import (id, "publicId", source, status, "createdBy", "createdAt") FROM stdin;
1	jk02y4dr9rh2	trello	success	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-12 01:08:05.350491
2	inos8elhcsfz	trello	success	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-12 01:08:47.499449
3	q0uh9kwyrls2	trello	success	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-12 01:17:41.967157
4	mo6zgymf88rp	trello	success	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-12 05:20:15.130993
5	ft8lnzcgoaed	trello	success	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-12 05:24:58.351425
6	lggvpvrjdr1g	trello	success	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-12 05:29:57.298194
7	zhstmqjzanqo	trello	success	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-12 05:46:58.353667
8	k58t29mqq7dt	trello	success	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-12 05:56:49.192664
9	x7rg4mcjakn7	trello	success	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-12 06:09:51.938493
10	3odp13sjyal8	trello	success	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-12 07:27:33.877664
11	swgsei9rnqcw	trello	success	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-12 08:00:39.641038
\.


--
-- Data for Name: integration; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.integration (provider, "userId", "accessToken", "refreshToken", "expiresAt", "createdAt", "updatedAt") FROM stdin;
trello	753536dc-ccc7-4855-b1ec-74ee55738568	ATTAa571b5d3f4b6ce428d2676f88c7491c8a158afe2d5568bf116cfa677a9fa7c8c0D071952	\N	2026-11-12 00:16:19.181	2025-11-12 00:16:19.183	2025-11-12 00:16:19.183
trello	63c29493-26c3-4f09-9575-9bd5000726e4	ATTA2a9853a29f5f8e7dfdd0a6467acf42cbf57546102cabec9d03bee04de8791d73D96B73CE	\N	2026-11-12 00:46:39.38	2025-11-12 00:46:39.382	2025-11-12 00:46:39.382
trello	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	ATTA2a9853a29f5f8e7dfdd0a6467acf42cbf57546102cabec9d03bee04de8791d73D96B73CE	\N	2026-11-12 00:58:30.976	2025-11-12 00:58:30.978	2025-11-12 00:58:30.978
\.


--
-- Data for Name: label; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.label (id, "publicId", name, "colourCode", "createdBy", "createdAt", "updatedAt", "boardId", "importId", "deletedAt", "deletedBy") FROM stdin;
\.


--
-- Data for Name: list; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.list (id, "publicId", name, index, "createdBy", "createdAt", "updatedAt", "deletedAt", "deletedBy", "boardId", "importId") FROM stdin;
4	67aasfwtj2lz	sdfsdf	0	753536dc-ccc7-4855-b1ec-74ee55738568	2025-11-12 00:03:09.440117	\N	\N	\N	11	\N
378	0alq08y7q5qs	iuyiuyiy	0	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 09:50:23.184479	\N	\N	\N	120	\N
\.


--
-- Data for Name: pomodoro_session; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.pomodoro_session (id, "publicId", "workspaceId", "userId", "cardId", duration, "breakDuration", "completedPomodoros", "targetPomodoros", "startTime", "endTime", "isCompleted", notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") FROM stdin;
3	2025-11-21 04:38:17.356	AyOyfMYvUqAYSidsRirYagyaOU3wT5Gj	2025-11-12 00:58:06.183	2025-11-14 04:38:17.356	104.32.168.252	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7
4	2025-11-21 05:32:47.646	CcDHKVZQjbvti4UvEpZoCukJRDE7Fmrl	2025-11-12 07:08:06.508	2025-11-14 05:32:47.646	104.32.168.252	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0	63c29493-26c3-4f09-9575-9bd5000726e4
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.subscription (id, plan, "referenceId", "stripeCustomerId", "stripeSubscriptionId", status, "periodStart", "periodEnd", "cancelAtPeriodEnd", seats, "trialStart", "trialEnd", "createdAt", "updatedAt", "unlimitedSeats") FROM stdin;
\.


--
-- Data for Name: time_block; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.time_block (id, "publicId", "workspaceId", "userId", title, description, "startTime", "endTime", "cardId", "goalId", color, "isRecurring", "recurrenceRule", "createdBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: time_entry; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.time_entry (id, "publicId", "workspaceId", "userId", type, description, "startTime", "endTime", duration, "isBillable", "hourlyRate", "cardId", "goalId", "habitId", tags, metadata, "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	fhw34l6a5nqi	5	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	other	My dog bath	2025-11-13 22:19:49.847	2025-11-13 22:19:51.649	1	f	\N	\N	\N	\N	[]	\N	2025-11-13 22:19:49.849892	2025-11-13 22:19:51.653	\N
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", "stripeCustomerId") FROM stdin;
753536dc-ccc7-4855-b1ec-74ee55738568	Don	thesensei@selfmaxing.io	f	\N	2025-11-11 17:29:37.877	2025-11-11 17:29:37.877	\N
63c29493-26c3-4f09-9575-9bd5000726e4	Jason White	jason@mailinator.com	f	\N	2025-11-12 00:18:31.287	2025-11-12 00:18:31.287	\N
f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	Bobby	bob@bob.com	f	\N	2025-11-12 00:58:06.165	2025-11-12 00:58:06.165	\N
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: workspace; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.workspace (id, "publicId", name, description, slug, plan, "createdBy", "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
1	bjxwp92i8feu	Test	\N	test	free	753536dc-ccc7-4855-b1ec-74ee55738568	2025-11-11 17:29:56.988028	\N	\N	\N
2	j6sosi7kbmor	trddd	\N	tdf	free	753536dc-ccc7-4855-b1ec-74ee55738568	2025-11-11 19:31:47.964197	\N	\N	\N
3	mywuld3u741n	test	\N	testeer	free	63c29493-26c3-4f09-9575-9bd5000726e4	2025-11-12 00:18:47.688856	\N	\N	\N
4	x6y5m2qxmx7q	sadf	\N	asdfsd	free	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-12 00:58:10.649489	\N	\N	\N
5	nvlej88ff49i	ghvhgvcgh	\N	ghfgfg	free	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 09:49:28.602675	\N	\N	\N
\.


--
-- Data for Name: workspace_invite_links; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.workspace_invite_links (id, "publicId", "workspaceId", code, status, "expiresAt", "createdAt", "createdBy", "updatedAt", "updatedBy") FROM stdin;
1	tsey9k2mssgw	4	drjp3blujj8f	active	2025-11-19 08:49:03.185	2025-11-12 08:49:03.187713	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	\N	\N
\.


--
-- Data for Name: workspace_members; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.workspace_members (id, "publicId", "userId", "workspaceId", "createdBy", "createdAt", "updatedAt", "deletedAt", "deletedBy", role, status, email) FROM stdin;
1	633v79khwzc3	753536dc-ccc7-4855-b1ec-74ee55738568	1	753536dc-ccc7-4855-b1ec-74ee55738568	2025-11-11 17:29:56.991243	\N	\N	\N	admin	active	thesensei@selfmaxing.io
2	1dimvuzxfucb	753536dc-ccc7-4855-b1ec-74ee55738568	2	753536dc-ccc7-4855-b1ec-74ee55738568	2025-11-11 19:31:47.972547	\N	\N	\N	admin	active	thesensei@selfmaxing.io
3	hqpha3691g1p	63c29493-26c3-4f09-9575-9bd5000726e4	3	63c29493-26c3-4f09-9575-9bd5000726e4	2025-11-12 00:18:47.692694	\N	\N	\N	admin	active	jason@mailinator.com
4	q0hdupoqhmqx	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	4	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-12 00:58:10.653478	\N	\N	\N	admin	active	bob@bob.com
5	p4jfzacbonmr	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	5	f48f7581-dfb5-4d76-b7f8-c634ab4d0df7	2025-11-13 09:49:28.607667	\N	\N	\N	admin	active	bob@bob.com
\.


--
-- Data for Name: workspace_slug_checks; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.workspace_slug_checks (id, slug, available, reserved, "workspaceId", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: workspace_slugs; Type: TABLE DATA; Schema: public; Owner: kan_user
--

COPY public.workspace_slugs (slug, type) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: kan_user
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 20, true);


--
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.account_id_seq', 3, true);


--
-- Name: apiKey_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public."apiKey_id_seq"', 1, true);


--
-- Name: board_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.board_id_seq', 120, true);


--
-- Name: card_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.card_activity_id_seq', 1739, true);


--
-- Name: card_checklist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.card_checklist_id_seq', 1, false);


--
-- Name: card_checklist_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.card_checklist_item_id_seq', 1, false);


--
-- Name: card_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.card_comments_id_seq', 1, false);


--
-- Name: card_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.card_id_seq', 1673, true);


--
-- Name: card_time_estimate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.card_time_estimate_id_seq', 1, false);


--
-- Name: feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.feedback_id_seq', 1, false);


--
-- Name: file_collaborators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.file_collaborators_id_seq', 1, false);


--
-- Name: file_shares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.file_shares_id_seq', 1, false);


--
-- Name: file_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.file_versions_id_seq', 1, false);


--
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.files_id_seq', 15, true);


--
-- Name: folders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.folders_id_seq', 6, true);


--
-- Name: goal_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.goal_activity_id_seq', 1, false);


--
-- Name: goal_check_in_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.goal_check_in_id_seq', 1, false);


--
-- Name: goal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.goal_id_seq', 1, false);


--
-- Name: goal_milestone_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.goal_milestone_id_seq', 1, false);


--
-- Name: habit_completion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.habit_completion_id_seq', 22, true);


--
-- Name: habit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.habit_id_seq', 2, true);


--
-- Name: habit_note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.habit_note_id_seq', 1, false);


--
-- Name: habit_template_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.habit_template_id_seq', 1, false);


--
-- Name: import_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.import_id_seq', 11, true);


--
-- Name: label_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.label_id_seq', 92, true);


--
-- Name: list_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.list_id_seq', 378, true);


--
-- Name: pomodoro_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.pomodoro_session_id_seq', 1, false);


--
-- Name: session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.session_id_seq', 4, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.subscription_id_seq', 1, false);


--
-- Name: time_block_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.time_block_id_seq', 1, false);


--
-- Name: time_entry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.time_entry_id_seq', 1, true);


--
-- Name: verification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.verification_id_seq', 1, false);


--
-- Name: workspace_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.workspace_id_seq', 5, true);


--
-- Name: workspace_invite_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.workspace_invite_links_id_seq', 1, true);


--
-- Name: workspace_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.workspace_members_id_seq', 5, true);


--
-- Name: workspace_slug_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kan_user
--

SELECT pg_catalog.setval('public.workspace_slug_checks_id_seq', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: kan_user
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: _card_labels _card_labels_cardId_labelId_pk; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public._card_labels
    ADD CONSTRAINT "_card_labels_cardId_labelId_pk" PRIMARY KEY ("cardId", "labelId");


--
-- Name: _card_workspace_members _card_workspace_members_cardId_workspaceMemberId_pk; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public._card_workspace_members
    ADD CONSTRAINT "_card_workspace_members_cardId_workspaceMemberId_pk" PRIMARY KEY ("cardId", "workspaceMemberId");


--
-- Name: _goal_cards _goal_cards_goalId_cardId_pk; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public._goal_cards
    ADD CONSTRAINT "_goal_cards_goalId_cardId_pk" PRIMARY KEY ("goalId", "cardId");


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: apiKey apiKey_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public."apiKey"
    ADD CONSTRAINT "apiKey_pkey" PRIMARY KEY (id);


--
-- Name: board board_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT board_pkey PRIMARY KEY (id);


--
-- Name: board board_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT "board_publicId_unique" UNIQUE ("publicId");


--
-- Name: card_activity card_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_activity
    ADD CONSTRAINT card_activity_pkey PRIMARY KEY (id);


--
-- Name: card_activity card_activity_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_activity
    ADD CONSTRAINT "card_activity_publicId_unique" UNIQUE ("publicId");


--
-- Name: card_checklist_item card_checklist_item_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_checklist_item
    ADD CONSTRAINT card_checklist_item_pkey PRIMARY KEY (id);


--
-- Name: card_checklist_item card_checklist_item_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_checklist_item
    ADD CONSTRAINT "card_checklist_item_publicId_unique" UNIQUE ("publicId");


--
-- Name: card_checklist card_checklist_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_checklist
    ADD CONSTRAINT card_checklist_pkey PRIMARY KEY (id);


--
-- Name: card_checklist card_checklist_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_checklist
    ADD CONSTRAINT "card_checklist_publicId_unique" UNIQUE ("publicId");


--
-- Name: card_comments card_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_comments
    ADD CONSTRAINT card_comments_pkey PRIMARY KEY (id);


--
-- Name: card_comments card_comments_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_comments
    ADD CONSTRAINT "card_comments_publicId_unique" UNIQUE ("publicId");


--
-- Name: card card_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_pkey PRIMARY KEY (id);


--
-- Name: card card_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT "card_publicId_unique" UNIQUE ("publicId");


--
-- Name: card_time_estimate card_time_estimate_cardId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_time_estimate
    ADD CONSTRAINT "card_time_estimate_cardId_unique" UNIQUE ("cardId");


--
-- Name: card_time_estimate card_time_estimate_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_time_estimate
    ADD CONSTRAINT card_time_estimate_pkey PRIMARY KEY (id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: file_collaborators file_collaborators_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_collaborators
    ADD CONSTRAINT file_collaborators_pkey PRIMARY KEY (id);


--
-- Name: file_shares file_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_shares
    ADD CONSTRAINT file_shares_pkey PRIMARY KEY (id);


--
-- Name: file_shares file_shares_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_shares
    ADD CONSTRAINT "file_shares_publicId_unique" UNIQUE ("publicId");


--
-- Name: file_versions file_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_versions
    ADD CONSTRAINT file_versions_pkey PRIMARY KEY (id);


--
-- Name: file_versions file_versions_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_versions
    ADD CONSTRAINT "file_versions_publicId_unique" UNIQUE ("publicId");


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: files files_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_publicId_unique" UNIQUE ("publicId");


--
-- Name: folders folders_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_pkey PRIMARY KEY (id);


--
-- Name: folders folders_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT "folders_publicId_unique" UNIQUE ("publicId");


--
-- Name: goal_activity goal_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_activity
    ADD CONSTRAINT goal_activity_pkey PRIMARY KEY (id);


--
-- Name: goal_activity goal_activity_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_activity
    ADD CONSTRAINT "goal_activity_publicId_unique" UNIQUE ("publicId");


--
-- Name: goal_check_in goal_check_in_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_check_in
    ADD CONSTRAINT goal_check_in_pkey PRIMARY KEY (id);


--
-- Name: goal_check_in goal_check_in_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_check_in
    ADD CONSTRAINT "goal_check_in_publicId_unique" UNIQUE ("publicId");


--
-- Name: goal_milestone goal_milestone_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_milestone
    ADD CONSTRAINT goal_milestone_pkey PRIMARY KEY (id);


--
-- Name: goal_milestone goal_milestone_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_milestone
    ADD CONSTRAINT "goal_milestone_publicId_unique" UNIQUE ("publicId");


--
-- Name: goal goal_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal
    ADD CONSTRAINT goal_pkey PRIMARY KEY (id);


--
-- Name: goal goal_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal
    ADD CONSTRAINT "goal_publicId_unique" UNIQUE ("publicId");


--
-- Name: habit_completion habit_completion_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_completion
    ADD CONSTRAINT habit_completion_pkey PRIMARY KEY (id);


--
-- Name: habit_completion habit_completion_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_completion
    ADD CONSTRAINT "habit_completion_publicId_unique" UNIQUE ("publicId");


--
-- Name: habit_note habit_note_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_note
    ADD CONSTRAINT habit_note_pkey PRIMARY KEY (id);


--
-- Name: habit_note habit_note_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_note
    ADD CONSTRAINT "habit_note_publicId_unique" UNIQUE ("publicId");


--
-- Name: habit habit_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit
    ADD CONSTRAINT habit_pkey PRIMARY KEY (id);


--
-- Name: habit habit_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit
    ADD CONSTRAINT "habit_publicId_unique" UNIQUE ("publicId");


--
-- Name: habit_template habit_template_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_template
    ADD CONSTRAINT habit_template_pkey PRIMARY KEY (id);


--
-- Name: habit_template habit_template_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_template
    ADD CONSTRAINT "habit_template_publicId_unique" UNIQUE ("publicId");


--
-- Name: import import_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.import
    ADD CONSTRAINT import_pkey PRIMARY KEY (id);


--
-- Name: import import_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.import
    ADD CONSTRAINT "import_publicId_unique" UNIQUE ("publicId");


--
-- Name: integration integration_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.integration
    ADD CONSTRAINT integration_pkey PRIMARY KEY ("userId", provider);


--
-- Name: label label_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.label
    ADD CONSTRAINT label_pkey PRIMARY KEY (id);


--
-- Name: label label_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.label
    ADD CONSTRAINT "label_publicId_unique" UNIQUE ("publicId");


--
-- Name: list list_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.list
    ADD CONSTRAINT list_pkey PRIMARY KEY (id);


--
-- Name: list list_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.list
    ADD CONSTRAINT "list_publicId_unique" UNIQUE ("publicId");


--
-- Name: pomodoro_session pomodoro_session_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.pomodoro_session
    ADD CONSTRAINT pomodoro_session_pkey PRIMARY KEY (id);


--
-- Name: pomodoro_session pomodoro_session_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.pomodoro_session
    ADD CONSTRAINT "pomodoro_session_publicId_unique" UNIQUE ("publicId");


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_token_unique UNIQUE (token);


--
-- Name: subscription subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (id);


--
-- Name: time_block time_block_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_block
    ADD CONSTRAINT time_block_pkey PRIMARY KEY (id);


--
-- Name: time_block time_block_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_block
    ADD CONSTRAINT "time_block_publicId_unique" UNIQUE ("publicId");


--
-- Name: time_entry time_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_entry
    ADD CONSTRAINT time_entry_pkey PRIMARY KEY (id);


--
-- Name: time_entry time_entry_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_entry
    ADD CONSTRAINT "time_entry_publicId_unique" UNIQUE ("publicId");


--
-- Name: user user_email_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_unique UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: workspace_invite_links workspace_invite_links_code_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_invite_links
    ADD CONSTRAINT workspace_invite_links_code_unique UNIQUE (code);


--
-- Name: workspace_invite_links workspace_invite_links_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_invite_links
    ADD CONSTRAINT workspace_invite_links_pkey PRIMARY KEY (id);


--
-- Name: workspace_invite_links workspace_invite_links_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_invite_links
    ADD CONSTRAINT "workspace_invite_links_publicId_unique" UNIQUE ("publicId");


--
-- Name: workspace_members workspace_members_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_pkey PRIMARY KEY (id);


--
-- Name: workspace_members workspace_members_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT "workspace_members_publicId_unique" UNIQUE ("publicId");


--
-- Name: workspace workspace_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace
    ADD CONSTRAINT workspace_pkey PRIMARY KEY (id);


--
-- Name: workspace workspace_publicId_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace
    ADD CONSTRAINT "workspace_publicId_unique" UNIQUE ("publicId");


--
-- Name: workspace_slug_checks workspace_slug_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_slug_checks
    ADD CONSTRAINT workspace_slug_checks_pkey PRIMARY KEY (id);


--
-- Name: workspace workspace_slug_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace
    ADD CONSTRAINT workspace_slug_unique UNIQUE (slug);


--
-- Name: workspace_slugs workspace_slugs_slug_unique; Type: CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_slugs
    ADD CONSTRAINT workspace_slugs_slug_unique UNIQUE (slug);


--
-- Name: board_source_idx; Type: INDEX; Schema: public; Owner: kan_user
--

CREATE INDEX board_source_idx ON public.board USING btree ("sourceBoardId");


--
-- Name: board_type_idx; Type: INDEX; Schema: public; Owner: kan_user
--

CREATE INDEX board_type_idx ON public.board USING btree (type);


--
-- Name: board_visibility_idx; Type: INDEX; Schema: public; Owner: kan_user
--

CREATE INDEX board_visibility_idx ON public.board USING btree (visibility);


--
-- Name: files_shareToken_idx; Type: INDEX; Schema: public; Owner: kan_user
--

CREATE INDEX "files_shareToken_idx" ON public.files USING btree ("shareToken");


--
-- Name: unique_slug_per_workspace; Type: INDEX; Schema: public; Owner: kan_user
--

CREATE UNIQUE INDEX unique_slug_per_workspace ON public.board USING btree ("workspaceId", slug) WHERE ("deletedAt" IS NULL);


--
-- Name: _card_labels _card_labels_cardId_card_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public._card_labels
    ADD CONSTRAINT "_card_labels_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES public.card(id) ON DELETE CASCADE;


--
-- Name: _card_labels _card_labels_labelId_label_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public._card_labels
    ADD CONSTRAINT "_card_labels_labelId_label_id_fk" FOREIGN KEY ("labelId") REFERENCES public.label(id) ON DELETE CASCADE;


--
-- Name: _card_workspace_members _card_workspace_members_cardId_card_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public._card_workspace_members
    ADD CONSTRAINT "_card_workspace_members_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES public.card(id) ON DELETE CASCADE;


--
-- Name: _card_workspace_members _card_workspace_members_workspaceMemberId_workspace_members_id_; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public._card_workspace_members
    ADD CONSTRAINT "_card_workspace_members_workspaceMemberId_workspace_members_id_" FOREIGN KEY ("workspaceMemberId") REFERENCES public.workspace_members(id) ON DELETE CASCADE;


--
-- Name: _goal_cards _goal_cards_cardId_card_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public._goal_cards
    ADD CONSTRAINT "_goal_cards_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES public.card(id) ON DELETE CASCADE;


--
-- Name: _goal_cards _goal_cards_goalId_goal_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public._goal_cards
    ADD CONSTRAINT "_goal_cards_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES public.goal(id) ON DELETE CASCADE;


--
-- Name: _habit_cards _habit_cards_cardId_card_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public._habit_cards
    ADD CONSTRAINT "_habit_cards_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES public.card(id) ON DELETE CASCADE;


--
-- Name: _habit_cards _habit_cards_habitId_habit_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public._habit_cards
    ADD CONSTRAINT "_habit_cards_habitId_habit_id_fk" FOREIGN KEY ("habitId") REFERENCES public.habit(id) ON DELETE CASCADE;


--
-- Name: account account_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: apiKey apiKey_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public."apiKey"
    ADD CONSTRAINT "apiKey_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: board board_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT "board_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: board board_deletedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT "board_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: board board_importId_import_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT "board_importId_import_id_fk" FOREIGN KEY ("importId") REFERENCES public.import(id);


--
-- Name: board board_workspaceId_workspace_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT "board_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES public.workspace(id) ON DELETE CASCADE;


--
-- Name: card_activity card_activity_cardId_card_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_activity
    ADD CONSTRAINT "card_activity_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES public.card(id) ON DELETE CASCADE;


--
-- Name: card_activity card_activity_commentId_card_comments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_activity
    ADD CONSTRAINT "card_activity_commentId_card_comments_id_fk" FOREIGN KEY ("commentId") REFERENCES public.card_comments(id) ON DELETE CASCADE;


--
-- Name: card_activity card_activity_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_activity
    ADD CONSTRAINT "card_activity_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: card_activity card_activity_fromListId_list_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_activity
    ADD CONSTRAINT "card_activity_fromListId_list_id_fk" FOREIGN KEY ("fromListId") REFERENCES public.list(id) ON DELETE CASCADE;


--
-- Name: card_activity card_activity_labelId_label_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_activity
    ADD CONSTRAINT "card_activity_labelId_label_id_fk" FOREIGN KEY ("labelId") REFERENCES public.label(id) ON DELETE CASCADE;


--
-- Name: card_activity card_activity_sourceBoardId_board_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_activity
    ADD CONSTRAINT "card_activity_sourceBoardId_board_id_fk" FOREIGN KEY ("sourceBoardId") REFERENCES public.board(id) ON DELETE SET NULL;


--
-- Name: card_activity card_activity_toListId_list_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_activity
    ADD CONSTRAINT "card_activity_toListId_list_id_fk" FOREIGN KEY ("toListId") REFERENCES public.list(id) ON DELETE CASCADE;


--
-- Name: card_activity card_activity_workspaceMemberId_workspace_members_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_activity
    ADD CONSTRAINT "card_activity_workspaceMemberId_workspace_members_id_fk" FOREIGN KEY ("workspaceMemberId") REFERENCES public.workspace_members(id) ON DELETE SET NULL;


--
-- Name: card_checklist card_checklist_cardId_card_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_checklist
    ADD CONSTRAINT "card_checklist_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES public.card(id) ON DELETE CASCADE;


--
-- Name: card_checklist card_checklist_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_checklist
    ADD CONSTRAINT "card_checklist_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: card_checklist card_checklist_deletedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_checklist
    ADD CONSTRAINT "card_checklist_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: card_checklist_item card_checklist_item_checklistId_card_checklist_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_checklist_item
    ADD CONSTRAINT "card_checklist_item_checklistId_card_checklist_id_fk" FOREIGN KEY ("checklistId") REFERENCES public.card_checklist(id) ON DELETE CASCADE;


--
-- Name: card_checklist_item card_checklist_item_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_checklist_item
    ADD CONSTRAINT "card_checklist_item_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: card_checklist_item card_checklist_item_deletedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_checklist_item
    ADD CONSTRAINT "card_checklist_item_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: card_comments card_comments_cardId_card_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_comments
    ADD CONSTRAINT "card_comments_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES public.card(id) ON DELETE CASCADE;


--
-- Name: card_comments card_comments_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_comments
    ADD CONSTRAINT "card_comments_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: card_comments card_comments_deletedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_comments
    ADD CONSTRAINT "card_comments_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: card card_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT "card_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: card card_deletedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT "card_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: card card_importId_import_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT "card_importId_import_id_fk" FOREIGN KEY ("importId") REFERENCES public.import(id);


--
-- Name: card card_listId_list_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT "card_listId_list_id_fk" FOREIGN KEY ("listId") REFERENCES public.list(id) ON DELETE CASCADE;


--
-- Name: card_time_estimate card_time_estimate_cardId_card_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_time_estimate
    ADD CONSTRAINT "card_time_estimate_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES public.card(id) ON DELETE CASCADE;


--
-- Name: card_time_estimate card_time_estimate_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.card_time_estimate
    ADD CONSTRAINT "card_time_estimate_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: feedback feedback_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT "feedback_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: file_collaborators file_collaborators_fileId_files_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_collaborators
    ADD CONSTRAINT "file_collaborators_fileId_files_id_fk" FOREIGN KEY ("fileId") REFERENCES public.files(id) ON DELETE CASCADE;


--
-- Name: file_collaborators file_collaborators_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_collaborators
    ADD CONSTRAINT "file_collaborators_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: file_shares file_shares_fileId_files_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_shares
    ADD CONSTRAINT "file_shares_fileId_files_id_fk" FOREIGN KEY ("fileId") REFERENCES public.files(id) ON DELETE CASCADE;


--
-- Name: file_shares file_shares_revokedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_shares
    ADD CONSTRAINT "file_shares_revokedBy_user_id_fk" FOREIGN KEY ("revokedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: file_shares file_shares_sharedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_shares
    ADD CONSTRAINT "file_shares_sharedBy_user_id_fk" FOREIGN KEY ("sharedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: file_shares file_shares_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_shares
    ADD CONSTRAINT "file_shares_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: file_versions file_versions_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_versions
    ADD CONSTRAINT "file_versions_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: file_versions file_versions_fileId_files_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.file_versions
    ADD CONSTRAINT "file_versions_fileId_files_id_fk" FOREIGN KEY ("fileId") REFERENCES public.files(id) ON DELETE CASCADE;


--
-- Name: files files_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: files files_deletedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: files files_folderId_folders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_folderId_folders_id_fk" FOREIGN KEY ("folderId") REFERENCES public.folders(id) ON DELETE CASCADE;


--
-- Name: files files_workspaceId_workspace_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES public.workspace(id) ON DELETE CASCADE;


--
-- Name: folders folders_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT "folders_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: folders folders_deletedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT "folders_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: folders folders_parentId_folders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT "folders_parentId_folders_id_fk" FOREIGN KEY ("parentId") REFERENCES public.folders(id) ON DELETE CASCADE;


--
-- Name: folders folders_workspaceId_workspace_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT "folders_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES public.workspace(id) ON DELETE CASCADE;


--
-- Name: goal_activity goal_activity_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_activity
    ADD CONSTRAINT "goal_activity_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: goal_activity goal_activity_goalId_goal_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_activity
    ADD CONSTRAINT "goal_activity_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES public.goal(id) ON DELETE CASCADE;


--
-- Name: goal_check_in goal_check_in_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_check_in
    ADD CONSTRAINT "goal_check_in_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: goal_check_in goal_check_in_goalId_goal_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_check_in
    ADD CONSTRAINT "goal_check_in_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES public.goal(id) ON DELETE CASCADE;


--
-- Name: goal goal_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal
    ADD CONSTRAINT "goal_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: goal goal_deletedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal
    ADD CONSTRAINT "goal_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: goal goal_linkedBoardId_board_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal
    ADD CONSTRAINT "goal_linkedBoardId_board_id_fk" FOREIGN KEY ("linkedBoardId") REFERENCES public.board(id) ON DELETE SET NULL;


--
-- Name: goal_milestone goal_milestone_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_milestone
    ADD CONSTRAINT "goal_milestone_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: goal_milestone goal_milestone_goalId_goal_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_milestone
    ADD CONSTRAINT "goal_milestone_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES public.goal(id) ON DELETE CASCADE;


--
-- Name: goal_milestone goal_milestone_linkedCardId_card_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal_milestone
    ADD CONSTRAINT "goal_milestone_linkedCardId_card_id_fk" FOREIGN KEY ("linkedCardId") REFERENCES public.card(id) ON DELETE SET NULL;


--
-- Name: goal goal_parentGoalId_goal_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal
    ADD CONSTRAINT "goal_parentGoalId_goal_id_fk" FOREIGN KEY ("parentGoalId") REFERENCES public.goal(id) ON DELETE SET NULL;


--
-- Name: goal goal_workspaceId_workspace_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.goal
    ADD CONSTRAINT "goal_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES public.workspace(id) ON DELETE CASCADE;


--
-- Name: habit_completion habit_completion_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_completion
    ADD CONSTRAINT "habit_completion_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: habit_completion habit_completion_habitId_habit_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_completion
    ADD CONSTRAINT "habit_completion_habitId_habit_id_fk" FOREIGN KEY ("habitId") REFERENCES public.habit(id) ON DELETE CASCADE;


--
-- Name: habit_completion habit_completion_linkedCardId_card_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_completion
    ADD CONSTRAINT "habit_completion_linkedCardId_card_id_fk" FOREIGN KEY ("linkedCardId") REFERENCES public.card(id) ON DELETE SET NULL;


--
-- Name: habit habit_linkedGoalId_goal_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit
    ADD CONSTRAINT "habit_linkedGoalId_goal_id_fk" FOREIGN KEY ("linkedGoalId") REFERENCES public.goal(id) ON DELETE SET NULL;


--
-- Name: habit_note habit_note_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_note
    ADD CONSTRAINT "habit_note_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: habit_note habit_note_habitId_habit_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_note
    ADD CONSTRAINT "habit_note_habitId_habit_id_fk" FOREIGN KEY ("habitId") REFERENCES public.habit(id) ON DELETE CASCADE;


--
-- Name: habit_template habit_template_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit_template
    ADD CONSTRAINT "habit_template_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: habit habit_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit
    ADD CONSTRAINT "habit_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: habit habit_workspaceId_workspace_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.habit
    ADD CONSTRAINT "habit_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES public.workspace(id) ON DELETE CASCADE;


--
-- Name: import import_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.import
    ADD CONSTRAINT "import_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: integration integration_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.integration
    ADD CONSTRAINT "integration_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: label label_boardId_board_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.label
    ADD CONSTRAINT "label_boardId_board_id_fk" FOREIGN KEY ("boardId") REFERENCES public.board(id) ON DELETE CASCADE;


--
-- Name: label label_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.label
    ADD CONSTRAINT "label_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: label label_deletedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.label
    ADD CONSTRAINT "label_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: label label_importId_import_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.label
    ADD CONSTRAINT "label_importId_import_id_fk" FOREIGN KEY ("importId") REFERENCES public.import(id);


--
-- Name: list list_boardId_board_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.list
    ADD CONSTRAINT "list_boardId_board_id_fk" FOREIGN KEY ("boardId") REFERENCES public.board(id) ON DELETE CASCADE;


--
-- Name: list list_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.list
    ADD CONSTRAINT "list_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: list list_deletedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.list
    ADD CONSTRAINT "list_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: list list_importId_import_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.list
    ADD CONSTRAINT "list_importId_import_id_fk" FOREIGN KEY ("importId") REFERENCES public.import(id);


--
-- Name: pomodoro_session pomodoro_session_cardId_card_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.pomodoro_session
    ADD CONSTRAINT "pomodoro_session_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES public.card(id) ON DELETE SET NULL;


--
-- Name: pomodoro_session pomodoro_session_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.pomodoro_session
    ADD CONSTRAINT "pomodoro_session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: pomodoro_session pomodoro_session_workspaceId_workspace_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.pomodoro_session
    ADD CONSTRAINT "pomodoro_session_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES public.workspace(id) ON DELETE CASCADE;


--
-- Name: session session_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: subscription subscription_referenceId_workspace_publicId_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT "subscription_referenceId_workspace_publicId_fk" FOREIGN KEY ("referenceId") REFERENCES public.workspace("publicId") ON DELETE SET NULL;


--
-- Name: time_block time_block_cardId_card_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_block
    ADD CONSTRAINT "time_block_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES public.card(id) ON DELETE SET NULL;


--
-- Name: time_block time_block_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_block
    ADD CONSTRAINT "time_block_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: time_block time_block_goalId_goal_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_block
    ADD CONSTRAINT "time_block_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES public.goal(id) ON DELETE SET NULL;


--
-- Name: time_block time_block_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_block
    ADD CONSTRAINT "time_block_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: time_block time_block_workspaceId_workspace_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_block
    ADD CONSTRAINT "time_block_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES public.workspace(id) ON DELETE CASCADE;


--
-- Name: time_entry time_entry_cardId_card_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_entry
    ADD CONSTRAINT "time_entry_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES public.card(id) ON DELETE SET NULL;


--
-- Name: time_entry time_entry_goalId_goal_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_entry
    ADD CONSTRAINT "time_entry_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES public.goal(id) ON DELETE SET NULL;


--
-- Name: time_entry time_entry_habitId_habit_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_entry
    ADD CONSTRAINT "time_entry_habitId_habit_id_fk" FOREIGN KEY ("habitId") REFERENCES public.habit(id) ON DELETE SET NULL;


--
-- Name: time_entry time_entry_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_entry
    ADD CONSTRAINT "time_entry_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: time_entry time_entry_workspaceId_workspace_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.time_entry
    ADD CONSTRAINT "time_entry_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES public.workspace(id) ON DELETE CASCADE;


--
-- Name: workspace workspace_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace
    ADD CONSTRAINT "workspace_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: workspace workspace_deletedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace
    ADD CONSTRAINT "workspace_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: workspace_invite_links workspace_invite_links_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_invite_links
    ADD CONSTRAINT "workspace_invite_links_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: workspace_invite_links workspace_invite_links_updatedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_invite_links
    ADD CONSTRAINT "workspace_invite_links_updatedBy_user_id_fk" FOREIGN KEY ("updatedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: workspace_invite_links workspace_invite_links_workspaceId_workspace_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_invite_links
    ADD CONSTRAINT "workspace_invite_links_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES public.workspace(id) ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_deletedBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT "workspace_members_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: workspace_members workspace_members_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT "workspace_members_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: workspace_members workspace_members_workspaceId_workspace_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT "workspace_members_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES public.workspace(id) ON DELETE CASCADE;


--
-- Name: workspace_slug_checks workspace_slug_checks_createdBy_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_slug_checks
    ADD CONSTRAINT "workspace_slug_checks_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: workspace_slug_checks workspace_slug_checks_workspaceId_workspace_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: kan_user
--

ALTER TABLE ONLY public.workspace_slug_checks
    ADD CONSTRAINT "workspace_slug_checks_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES public.workspace(id);


--
-- Name: _card_labels; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public._card_labels ENABLE ROW LEVEL SECURITY;

--
-- Name: _card_workspace_members; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public._card_workspace_members ENABLE ROW LEVEL SECURITY;

--
-- Name: _goal_cards; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public._goal_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: _habit_cards; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public._habit_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: account; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.account ENABLE ROW LEVEL SECURITY;

--
-- Name: apiKey; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public."apiKey" ENABLE ROW LEVEL SECURITY;

--
-- Name: board; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.board ENABLE ROW LEVEL SECURITY;

--
-- Name: card; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.card ENABLE ROW LEVEL SECURITY;

--
-- Name: card_activity; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.card_activity ENABLE ROW LEVEL SECURITY;

--
-- Name: card_checklist; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.card_checklist ENABLE ROW LEVEL SECURITY;

--
-- Name: card_checklist_item; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.card_checklist_item ENABLE ROW LEVEL SECURITY;

--
-- Name: card_comments; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.card_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: card_time_estimate; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.card_time_estimate ENABLE ROW LEVEL SECURITY;

--
-- Name: feedback; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: file_collaborators; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.file_collaborators ENABLE ROW LEVEL SECURITY;

--
-- Name: file_shares; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;

--
-- Name: file_versions; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: files; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

--
-- Name: folders; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

--
-- Name: goal; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.goal ENABLE ROW LEVEL SECURITY;

--
-- Name: goal_activity; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.goal_activity ENABLE ROW LEVEL SECURITY;

--
-- Name: goal_check_in; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.goal_check_in ENABLE ROW LEVEL SECURITY;

--
-- Name: goal_milestone; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.goal_milestone ENABLE ROW LEVEL SECURITY;

--
-- Name: habit; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.habit ENABLE ROW LEVEL SECURITY;

--
-- Name: habit_completion; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.habit_completion ENABLE ROW LEVEL SECURITY;

--
-- Name: habit_note; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.habit_note ENABLE ROW LEVEL SECURITY;

--
-- Name: habit_template; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.habit_template ENABLE ROW LEVEL SECURITY;

--
-- Name: import; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.import ENABLE ROW LEVEL SECURITY;

--
-- Name: integration; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.integration ENABLE ROW LEVEL SECURITY;

--
-- Name: label; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.label ENABLE ROW LEVEL SECURITY;

--
-- Name: list; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.list ENABLE ROW LEVEL SECURITY;

--
-- Name: pomodoro_session; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.pomodoro_session ENABLE ROW LEVEL SECURITY;

--
-- Name: session; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.session ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.subscription ENABLE ROW LEVEL SECURITY;

--
-- Name: time_block; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.time_block ENABLE ROW LEVEL SECURITY;

--
-- Name: time_entry; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.time_entry ENABLE ROW LEVEL SECURITY;

--
-- Name: user; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;

--
-- Name: verification; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.verification ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.workspace ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_invite_links; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.workspace_invite_links ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_members; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_slug_checks; Type: ROW SECURITY; Schema: public; Owner: kan_user
--

ALTER TABLE public.workspace_slug_checks ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: kan_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict vmDUp9H4Za9NHBNSWOaDVcreQ0D6UJiAJfu5FmYmzkSbsoenVIuFprC7cbzehq5

