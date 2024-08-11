export type sharedCamera = {
  id: number,
  name: string,
  type: string,
  snapshot: {
    url: string | null,
    created_at: string
  } | null,
  status: string,
  live_snapshot: string | null,
  streams: [{
    url: string,
    format: string,
    refresh_rate?: number
  }],
  owner: {
    first_name?: string,
    last_name?: string,
    email: string
  },
  has_recording: boolean,
  has_notifications: boolean
}

export type segment = {
  start: string,
  end: string,
  iso_start: string,
  iso_end: string,
}

export type records = {
  records: {
    start: string
    end: string
    segments:segment[]
  }
}

export type recordStream = {
  stream: {
    url: string,
    format: string
  }
}

export type camera = {
  camera: sharedCamera,
  interval_pairs?: [[string]],
}

  