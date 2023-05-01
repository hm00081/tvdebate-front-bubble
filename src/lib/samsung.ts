import axios from "axios";
import _ from "lodash";
const HOST = "http://summarnoteweb.koreacentral.cloudapp.azure.com";

export interface Meeting {
  title: string;
  meetingDatetime: string;
  recentModifiedDatetime: string;
  meetingId: string;
  participants: Participant[];
  isComplete: boolean;
  isNoteWritten: boolean;
  isBookmarked: boolean;
  insights?: Insights;
  duration: number;
}
export interface Participant {
  participantId: string;
  participantName: string;
}

export interface UpcomingMeeting {
  title: string;
  upcomingMeetingId: string;
  meetingDatetime: string;
}

export interface MeetingInfo extends Meeting {
  fileUrl: string;
  Agenda: Agenda[];
  events: string[];
  Images: Array<{ imageId: string; url: string }>;
}

export interface Agenda {
  agendaId: number;
  agendaText: string;
  rowId: string;
}

export interface Text {
  startTime: number;
  endTime: number;
  rowId: string;
  text: string;
  talkerId: string;
  talkerName: string;
  bookmark: string;
}

export interface Insights {
  exist?: boolean;
  process?: boolean;
  data?: {
    edges: Array<{ count: number; from: string; to: string; width: number }>;
    nodes: Array<{
      count: number;
      font: any;
      id: string;
      label: string;
      size: number;
    }>;
    topics: Array<{
      count: number;
      label: string;
      keywords: Array<{ label: string; count: number }>;
    }>;
  };
}

export interface MeetingStat {
  count: number;
  time: number;
}
export interface MeetingStatDay {
  startTime: string;
  endTime: string;
  totalTime: number;
  totalCount: number;
  dayCount: number;
  stat: MeetingStat[];
}

export interface ParticipantStat {
  participantId: string;
  participantName: string;
  meetingCount: number;
  speakingCount: number;
  time: number;
}
export interface ParticipantsStat {
  startTime: string;
  endTime: string;
  totlaParticipant: number;
  totalMeetingCount: number;
  totalSpeakingCount: number;
  totalTime: number;
  dayCount: number;
  stat: ParticipantStat[];
}

export class Samsung {
  public readonly syskey: string =
    "ab113740-caa9-46e8-adf8-d83fbcf1628b-b23f9e42-77af-4c8d-8af5-e00259898d16";
  public async getMeetingList(sysKey: string, uid: string): Promise<Meeting[]> {
    const r = (
      await axios.get(`${HOST}/api/get/meetingList`, {
        headers: {
          Syskey: sysKey,
          uid,
        },
      })
    ).data;
    return r.meetings;
  }
  public async getMeetingInfo(
    sysKey: string,
    uid: string,
    meetingId: string
  ): Promise<Meeting> {
    const r = await axios.get(`${HOST}/api/get/meetingInfo`, {
      headers: {
        Syskey: sysKey,
        uid,
        meetingId,
      },
    });

    if (!_.isNil(r.data.insights) && !_.isEmpty(r.data.insights)) {
      // console.log('insights exist');
      try {
        r.data.insights = JSON.parse(r.data.insights);
      } catch (e) {
        r.data.insights = {
          exist: false,
          process: false,
        };
        console.error("GET MEETING ERROR JSON PARSE");
        console.error(e);
      }
    }
    // console.error('RESULT', r);
    return r.data;
  }

  // TODO agenda test 필요
  public async getMeetingText(
    sysKey: string,
    meetingId: string,
    queryObj?: { type?: string; agenda?: string }
  ): Promise<{ type: string; texts: Text[] }> {
    let url = `${HOST}/api/get/meetingText`;
    if (!_.isNil(queryObj)) {
      if (!_.isNil(queryObj.type) && !_.isNil(queryObj.agenda)) {
        // TODO
        // queryObj.type이 fullscript, highlight, actionItem 이 아닐때 안보내야하나?
        // 아니면 보내고 에러 처리?
        url = url.concat("?type=", queryObj.type);
        url = url.concat("&agenda=", queryObj.agenda);
      } else if (!_.isNil(queryObj.type)) {
        url = url.concat("?type=", queryObj.type);
      } else if (!_.isNil(queryObj.agenda)) {
        url = url.concat("?agenda=", queryObj.agenda);
      }
    }

    const r = (
      await axios.get(url, {
        headers: {
          Syskey: sysKey,
          meetingId,
        },
      })
    ).data;
    return r;
  }

  public async getMeetingStatDay(
    sysKey: string,
    uid: string,
    queryObj?: { starttime: string; endtime: string }
  ): Promise<MeetingStatDay> {
    let url = `${HOST}/api/get/meetingStatDay`;
    if (!_.isNil(queryObj)) {
      url = url.concat("?starttime=", queryObj.starttime);
      url = url.concat("&endtime=", queryObj.endtime);
    }
    const r = (
      await axios.get(url, {
        headers: {
          Syskey: sysKey,
          uid,
        },
      })
    ).data;
    return r;
  }

  public async addMeetingInsight(
    sysKey: string,
    uid: string,
    meetingId: string,
    data: { [key: string]: any }
  ): Promise<boolean> {
    const url = `${HOST}/api/post/updateInsights`;
    const body = JSON.stringify(data);
    console.warn("body", body);
    const r = (
      await axios.post(
        url,
        { meetingId, uid, body },
        {
          headers: {
            Syskey: sysKey,
            uid,
          },
        }
      )
    ).data;
    return r.isSuccess;
  }
  // TODO test 필요 -> 에러남
  public async getParticipantStat(
    sysKey: string,
    uid: string,
    queryObj?: { starttime: string; endtime: string }
  ): Promise<ParticipantsStat> {
    let url = `${HOST}/api/get/participantStat`;
    if (!_.isNil(queryObj)) {
      url = url.concat("?starttime=", queryObj.starttime);
      url = url.concat("&endtime=", queryObj.endtime);
    }
    const r = (
      await axios.get(url, {
        headers: {
          Syskey: sysKey,
          uid,
        },
      })
    ).data;
    return r;
  }
}

const samsung = new Samsung();

export default samsung;

// TODO sysKey가 고정되있는건지?
