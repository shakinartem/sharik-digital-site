export type UserState =
  | { kind: "diagnostic"; step: number; answers: Record<string, string>; source_route?: string }
  | { kind: "contact_request" }
  | { kind: "question"; question_kind: string };

type RawState = {
  state?: string;
  data_json?: string;
};

let memoryState: Record<number, { state: string; data: any }> = {};

export async function getUserState(db: D1Database, telegramId: number): Promise<UserState | null> {
  const row = memoryState[telegramId];
  if (row) {
    return decodeState(row.state, row.data);
  }

  const result = await db.prepare("SELECT state, data_json FROM states WHERE telegram_id = ?").bind(telegramId).first();
  if (!result) return null;

  const data = JSON.parse((result as any).data_json || "{}");
  memoryState[telegramId] = { state: (result as any).state, data };
  return decodeState((result as any).state, data);
}

export async function setUserState(db: D1Database, telegramId: number, state: UserState | null) {
  if (state === null) {
    delete memoryState[telegramId];
    await db.prepare("DELETE FROM states WHERE telegram_id = ?").bind(telegramId).run();
    return;
  }

  const encoded = encodeState(state);
  memoryState[telegramId] = encoded;
  const now = new Date().toISOString();
  await db.prepare("INSERT INTO states (telegram_id, state, data_json, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(telegram_id) DO UPDATE SET state = ?, data_json = ?, updated_at = ?")
    .bind(telegramId, encoded.state, encoded.data, now, encoded.state, encoded.data, now)
    .run();
}

function decodeState(state: string | undefined, data: any): UserState | null {
  if (!state) return null;
  if (state === "diagnostic") {
    return { kind: "diagnostic", step: Number(data.step || 0), answers: data.answers || {}, source_route: data.source_route };
  }
  if (state === "contact_request") {
    return { kind: "contact_request" };
  }
  if (state === "question") {
    return { kind: "question", question_kind: data.question_kind || "free_text" };
  }
  return null;
}

function encodeState(state: UserState): { state: string; data: string } {
  const base: Record<string, any> = {};
  if (state.kind === "diagnostic") {
    base.step = state.step;
    base.answers = state.answers;
    base.source_route = state.source_route;
  }
  if (state.kind === "question") {
    base.question_kind = state.question_kind;
  }

  return { state: state.kind, data: JSON.stringify(base) };
}