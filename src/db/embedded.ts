import { newDb, DataType } from "pg-mem";
import crypto from "crypto";

export function createEmbeddedPgPool() {
  const mem = newDb({
    autoCreateForeignKeyIndices: true,
  });

  mem.public.registerFunction({
    name: "gen_random_uuid",
    returns: DataType.text,
    impure: true,
    implementation: () => crypto.randomUUID(),
  });

  // Polyfill common postgres functions needed by queries
  mem.public.registerFunction({
    name: "version",
    returns: DataType.text,
    implementation: () => "PostgreSQL 16.0 (pg-mem embedded)",
  });

  mem.public.none(`
    CREATE TYPE gender AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');
    CREATE TYPE chat_status AS ENUM ('pending', 'accepted', 'expired', 'declined');
    CREATE TYPE message_kind AS ENUM ('text', 'image', 'voice', 'system');
    CREATE TYPE report_category AS ENUM ('harassment', 'fake_profile', 'spam');
    CREATE TYPE report_status AS ENUM ('open', 'reviewed', 'actioned');

    CREATE TABLE users (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name varchar(120) NOT NULL,
      reg_id varchar(32) NOT NULL UNIQUE,
      email varchar(180) NOT NULL UNIQUE,
      mobile varchar(20) NOT NULL UNIQUE,
      gender gender NOT NULL,
      course varchar(80) NOT NULL,
      academic_year integer NOT NULL,
      interests jsonb NOT NULL DEFAULT '[]'::jsonb,
      looking_for varchar(60),
      avatar_hue integer NOT NULL DEFAULT 140,
      visible boolean NOT NULL DEFAULT true,
      is_demo boolean NOT NULL DEFAULT false,
      is_restricted boolean NOT NULL DEFAULT false,
      password_hash text,
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE TABLE otp_codes (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      identifier varchar(180) NOT NULL,
      kind varchar(10) NOT NULL,
      code varchar(6) NOT NULL,
      used_at timestamp with time zone,
      expires_at timestamp with time zone NOT NULL,
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE TABLE auth_sessions (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      token varchar(64) NOT NULL UNIQUE,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE TABLE chat_sessions (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      initiator_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status chat_status NOT NULL DEFAULT 'pending',
      media_unlocked boolean NOT NULL DEFAULT false,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      timer_ends_at timestamp with time zone NOT NULL,
      accepted_at timestamp with time zone,
      expired_at timestamp with time zone,
      waived_at timestamp with time zone,
      initiator_last_read timestamp with time zone DEFAULT now(),
      receiver_last_read timestamp with time zone DEFAULT now()
    );

    CREATE TABLE messages (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id text NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
      sender_id text REFERENCES users(id) ON DELETE SET NULL,
      kind message_kind NOT NULL DEFAULT 'text',
      body text NOT NULL,
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE TABLE events (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      title varchar(140) NOT NULL,
      description text NOT NULL DEFAULT '',
      location varchar(120) NOT NULL,
      starts_at timestamp with time zone NOT NULL,
      tag varchar(40) NOT NULL DEFAULT 'meetup',
      image text NOT NULL DEFAULT ''
    );

    CREATE TABLE event_rsvps (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      wants_buddy boolean NOT NULL DEFAULT true,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      CONSTRAINT rsvp_unique_idx UNIQUE(event_id, user_id)
    );

    CREATE TABLE places (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      name varchar(120) NOT NULL,
      kind varchar(20) NOT NULL,
      x real NOT NULL,
      y real NOT NULL
    );

    CREATE TABLE vendors (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      place_id text REFERENCES places(id) ON DELETE SET NULL,
      name varchar(120) NOT NULL,
      blurb text NOT NULL DEFAULT '',
      is_open boolean NOT NULL DEFAULT true,
      image text NOT NULL DEFAULT '',
      top_dish varchar(120),
      x real NOT NULL DEFAULT 50,
      y real NOT NULL DEFAULT 50,
      menu jsonb NOT NULL DEFAULT '[]'::jsonb
    );

    CREATE TABLE reviews (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id text NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating integer NOT NULL,
      body text NOT NULL DEFAULT '',
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE TABLE reports (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reported_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category report_category NOT NULL,
      details text NOT NULL DEFAULT '',
      evidence_url text NOT NULL,
      status report_status NOT NULL DEFAULT 'open',
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE TABLE blocks (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      blocker_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      blocked_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      CONSTRAINT block_pair_idx UNIQUE(blocker_id, blocked_id)
    );

    CREATE TABLE announcements (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      title varchar(160) NOT NULL,
      body text NOT NULL,
      pinned boolean NOT NULL DEFAULT false,
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE TABLE skills (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL UNIQUE,
      category text NOT NULL
    );

    CREATE TABLE user_skills (
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skill_id text NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      proficiency text NOT NULL DEFAULT 'Intermediate',
      PRIMARY KEY (user_id, skill_id)
    );

    CREATE TABLE map_beacons (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title text NOT NULL,
      type text NOT NULL,
      lat double precision NOT NULL,
      lng double precision NOT NULL,
      expires_at timestamp with time zone NOT NULL,
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE TABLE opportunities (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      poster_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title text NOT NULL,
      company text NOT NULL,
      type text NOT NULL,
      stipend text NOT NULL DEFAULT 'Unpaid / Credits',
      category text NOT NULL DEFAULT 'For You',
      status text NOT NULL DEFAULT 'Open',
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );

    CREATE TABLE opportunity_skills (
      opportunity_id text NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      skill_id text NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      PRIMARY KEY (opportunity_id, skill_id)
    );

    CREATE TABLE applications (
      id text PRIMARY KEY DEFAULT gen_random_uuid(),
      applicant_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      opportunity_id text NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      status text NOT NULL DEFAULT 'Pending',
      applied_at timestamp with time zone NOT NULL DEFAULT now()
    );
  `);

  const adapter = mem.adapters.createPg();
  const rawPool = new adapter.Pool();

  const origQuery = rawPool.query.bind(rawPool);

  rawPool.query = function (config: any, values: any, cb: any) {
    const callback =
      typeof values === "function"
        ? values
        : typeof config === "object" && typeof cb === "function"
          ? cb
          : null;
    const params = Array.isArray(values)
      ? values
      : typeof config === "object"
        ? config.values
        : [];
    const isArrayMode = typeof config === "object" && config.rowMode === "array";

    const execute = (resolve: any, reject: any) => {
      try {
        const queryObj =
          typeof config === "string"
            ? { text: config, values: params }
            : { ...config, values: params };
        delete queryObj.rowMode;
        delete queryObj.types;

        origQuery(queryObj, params, (err: any, res: any) => {
          if (err) {
            if (callback) callback(err);
            if (reject) reject(err);
            return;
          }

          const colNames = res?.rows?.[0] ? Object.keys(res.rows[0]) : [];
          const fields = colNames.map((name) => ({
            name,
            tableID: 0,
            columnID: 0,
            dataTypeID: 25,
            dataTypeSize: -1,
            dataTypeModifier: -1,
            format: "text",
          }));

          const finalRows =
            isArrayMode && res?.rows
              ? res.rows.map((row: any) =>
                  Array.isArray(row) ? row : colNames.map((k) => row[k])
                )
              : res?.rows ?? [];

          const finalRes = {
            command: res?.command ?? "SELECT",
            rowCount: res?.rowCount ?? finalRows.length,
            rows: finalRows,
            fields,
          };

          if (callback) callback(null, finalRes);
          if (resolve) resolve(finalRes);
        });
      } catch (e) {
        if (callback) callback(e);
        if (reject) reject(e);
      }
    };

    if (!callback) {
      return new Promise((resolve, reject) => execute(resolve, reject));
    }
    execute(null, null);
  };

  return rawPool;
}
