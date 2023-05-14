import { OccurrenceMaker } from "./OccurrenceMaker";
/* eslint-disable no-unused-vars */
import axios from "axios";
import { SimilarityBlock } from "../interfaces";
import _ from "lodash";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import { DataStructureManager } from "../DataStructureMaker/DataStructureManager";
import {
  ParticipantCount,
  TermCountDetailDict,
  TermCountDictOfEGMaker,
} from "./TermCountDictOfEGMaker";
import { ParticipantDict } from "../../../common_functions/makeParticipants";
import {
  CategoryTermCount,
  TermCountDict,
  UtteranceObject,
} from "../../../interfaces/DebateDataInterface";
import { pythonFlaskAddress } from "../../../constants/constants";
import { TermType } from "../DataImporter";
import { BooleanLiteral } from "@babel/types";

export interface NodeDatum extends SimulationNodeDatum {
  id: string;
  name?: string;
  group: "keyterm" | "term" | "speaker";
  count: number;
  booleanCount: number;
  participantCounts: ParticipantCount[]; // multiple count per 1 utterance
  participantBooleanCounts: ParticipantCount[]; // 1 count per 1 utterance
  time?: number;
  categoryTermCounts?: CategoryTermCount[]; // new field
}

export interface LinkDatum extends SimulationLinkDatum<NodeDatum> {
  id: string;
  count: number;
}
export interface NodeLinkDict {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

// Pure Local Creating Node and Link Data
export class GraphDataStructureMaker {
  private nodes!: NodeDatum[];
  private links!: LinkDatum[];
  private termListOfEG!: string[];
  private cooccurrenceMatrixOfEG!: number[][];

  public constructor(
    engagementGroup: SimilarityBlock[][],
    participantDict: ParticipantDict,
    utteranceObjects: UtteranceObject[],
    termType: TermType
  ) {
    if (!engagementGroup || engagementGroup.length === 0) {
      console.warn("EngagementGroup is undefined or empty.");
      this.nodes = [];
      return;
    }

    const startIndex = engagementGroup[0][0].columnUtteranceIndex;
    const endIndex = startIndex + engagementGroup.length;
    const utteranceObjectsOfEG = _.filter(
      utteranceObjects,
      (utteranceObject, utteranceIndex) =>
        startIndex <= utteranceIndex && utteranceIndex <= endIndex
    );

    const termCountDictOfEGMaker = new TermCountDictOfEGMaker(
      utteranceObjectsOfEG,
      participantDict,
      termType
    );
    const termCountDictOfEG = termCountDictOfEGMaker.getTermCountDictOfEG();
    const termBooleanCountDictOfEG = termCountDictOfEGMaker.getTermBooleanCountDictOfEG();
    const termCountDetailDictOfEG = termCountDictOfEGMaker.getTermCountDetailDictOfEG();
    const termBooleanCountDetailDictOfEG = termCountDictOfEGMaker.getTermBooleanCountDetailDictOfEG();
    //console.log(termCountDetailDictOfEG); // 찬반 데이터 포함되어있음
    this.termListOfEG = this.makeTermListOfEG(termCountDictOfEG, 1);
    const frequencyVectorOfEG = this.makeFrequencyVectorOfEG(
      this.termListOfEG,
      termCountDictOfEG
    );
    const booleanFrequencyVectorOfEG = this.makeFrequencyVectorOfEG(
      this.termListOfEG,
      termBooleanCountDictOfEG
    );

    const occurrenceMaker =
      termType !== "compound_term"
        ? new OccurrenceMaker(
            utteranceObjectsOfEG,
            this.termListOfEG,
            "compoundTermCountDict",
            3
          )
        : new OccurrenceMaker(
            utteranceObjectsOfEG,
            this.termListOfEG,
            "compoundTermCountDict",
            3
          );
    this.cooccurrenceMatrixOfEG = occurrenceMaker.cooccurrenceMatrix;

    this.nodes = this.makeNodes(
      this.termListOfEG,
      frequencyVectorOfEG,
      booleanFrequencyVectorOfEG,
      termCountDetailDictOfEG,
      termBooleanCountDetailDictOfEG,
      utteranceObjectsOfEG
    );
  }

  public generateNodesAndLinks(
    standardCooccurrenceToGenerateLinks: number,
    maxOfLinksPerNode: number,
    isNodeNotHavingLinksShown: boolean
  ): NodeLinkDict {
    this.links = this.makeLinks(
      this.termListOfEG,
      this.cooccurrenceMatrixOfEG,
      standardCooccurrenceToGenerateLinks,
      maxOfLinksPerNode
    );

    return {
      nodes: isNodeNotHavingLinksShown
        ? this.nodes
        : this.filterNodes(this.nodes, this.links),
      links: this.links,
    };
  }

  public getCooccurrenceMatrixOfEG() {
    return this.cooccurrenceMatrixOfEG;
  }
  public getTermListOfEG() {
    return this.termListOfEG;
  }

  /**
   * Remove nodes not having links
   * @param nodes
   * @param links
   * @param termListOfEG
   */
  private filterNodes(nodes: NodeDatum[], links: LinkDatum[]): NodeDatum[] {
    const nodeDict = _.keyBy(nodes, (node) => node.id);
    _.forEach(nodes, (node) => {
      const foundIndex = _.findIndex(
        links,
        (link) => link.source === node.id || link.target === node.id
      );

      if (foundIndex === -1) {
        delete nodeDict[node.id];
      }
    });

    return _.values(nodeDict);
  }

  private makeTermListOfEG(
    termCountDict: TermCountDict,
    standardHighCount: number
  ) {
    const termListOfEG: string[] = [];
    _.forEach(termCountDict, (count, term) => {
      if (count >= standardHighCount) termListOfEG.push(term);
    });
    termListOfEG.sort();
    return termListOfEG;
  }
  private makeFrequencyVectorOfEG(
    termListOfEG: string[],
    termCountDictOfEG: TermCountDict
  ) {
    const frequencyVectorOfEG: number[] = _.map(
      termListOfEG,
      (term) => termCountDictOfEG[term]
    );
    return frequencyVectorOfEG;
  }

  /**
   * Deprecated
   * @param engagementGroup
   * @param termListOfEG
   * @param utteranceObjects
   */
  private makeCooccurrenceMatrixOfEG(
    engagementGroup: SimilarityBlock[][],
    termListOfEG: string[],
    utteranceObjects: UtteranceObject[]
  ): Promise<number[][]> {
    const startIndex = engagementGroup[1][0].columnUtteranceIndex;
    const endIndex =
      engagementGroup[engagementGroup.length - 1][0].rowUtteranceIndex;
    const utteranceObjectsOfEG = _.filter(
      utteranceObjects,
      (utteranceObject, utteranceIndex) =>
        utteranceIndex >= startIndex && utteranceIndex <= endIndex
          ? true
          : false
    );

    return new Promise<number[][]>((resolve, reject) => {
      axios
        .post<number[][]>(pythonFlaskAddress + "/make-cooccurrence-matrix", {
          utteranceObjectsOfEG,
          termListOfEG,
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((reason) => {
          reject(reason);
        });
    });
  }

  private makeNodes(
    termListOfEG: string[],
    frequencyVectorOfEG: number[],
    booleanFrequencyVectorOfEG: number[],
    termCountDetailDictOfEG: TermCountDetailDict,
    termBooleanCountDetailDictOfEG: TermCountDetailDict,
    utteranceObjectsOfEG: UtteranceObject[] // add this
  ): NodeDatum[] {
    const nodes = _.map<string, NodeDatum>(termListOfEG, (term, termIndex) => {
      const utteranceObjectFound = utteranceObjectsOfEG.find(
        (utteranceObject) =>
          utteranceObject.sentenceObjects.some(
            (sentenceObject) =>
              sentenceObject.compoundTermCountDict[term] != null ||
              Object.values(sentenceObject.allTermCountDict || {}).some(
                (termCountDict) => termCountDict[term] != null
              )
          )
      );

      let termTime;
      let categoryTermCounts: CategoryTermCount[] = [];
      if (utteranceObjectFound) {
        const sentenceObjectFound = utteranceObjectFound.sentenceObjects.find(
          (sentenceObject) =>
            sentenceObject.compoundTermCountDict[term] != null ||
            Object.values(sentenceObject.allTermCountDict || {}).some(
              (termCountDict) => termCountDict[term] != null
            )
        );
        if (sentenceObjectFound && sentenceObjectFound.time) {
          termTime = convertTimeToSeconds(sentenceObjectFound.time);
          categoryTermCounts = Object.entries(
            sentenceObjectFound.allTermCountDict || {}
          )
            .map(([category, termCountDict]) => ({
              category,
              count: termCountDict[term] || 0,
            }))
            .filter(({ count }) => count > 0);
        }
      }

      return {
        id: term,
        group: "term",
        time: termTime,
        count: frequencyVectorOfEG[termIndex],
        booleanCount: booleanFrequencyVectorOfEG[termIndex],
        participantCounts: _.values(termCountDetailDictOfEG[term]),
        participantBooleanCounts: _.values(
          termBooleanCountDetailDictOfEG[term]
        ),
        categoryTermCounts: categoryTermCounts, // use here
      };
    });
    //console.log(nodes);
    return nodes;
  }
  private makeLinks(
    termListOfEG: string[],
    cooccurrenceMatrixOfEG: number[][],
    standardHighCooccurrence: number,
    maxOflinksPerNode: number
  ): LinkDatum[] {
    const linkCandidateDict: { [linkId: string]: LinkDatum } = {};

    // for each termListOfEG, make links based on cooccurrenceVector
    _.forEach(termListOfEG, (sourceTerm, sourceTermIndex) => {
      const cooccurrenceVectorOfATerm = cooccurrenceMatrixOfEG[sourceTermIndex];
      const targetObjects = _.chain(cooccurrenceVectorOfATerm)
        .map((count, termIndex) => ({
          term: termListOfEG[termIndex],
          termIndex,
          count,
        }))
        .orderBy((targetObject) => targetObject.count, ["desc"])
        .value();
      const filteredTargetObjects = _.filter(
        targetObjects,
        (targetObject) =>
          targetObject.count > standardHighCooccurrence &&
          sourceTerm !== targetObject.term
      );

      let selectedTargetObjects!: {
        term: string;
        termIndex: number;
        count: number;
      }[];
      if (filteredTargetObjects.length !== 0) {
        selectedTargetObjects = filteredTargetObjects;
      } else {
        // related below commented code
        // TODO If 1 node don't have any links, insert 1 link having most count
        // selectedTargetObjects = [targetObjects[1]];
      }

      _.forEach(selectedTargetObjects, (selectedTargetObject) => {
        const targetTerm = selectedTargetObject.term;
        const linkId =
          sourceTerm < targetTerm
            ? `${sourceTerm}-${targetTerm}`
            : `${targetTerm}-${sourceTerm}`;
        linkCandidateDict[linkId] = {
          id: linkId,
          source: sourceTerm,
          target: selectedTargetObject.term,
          count: selectedTargetObject.count,
        };
      });
    });

    // delete links until max_of_links_per_node
    const filteredLinkDict: { [linkId: string]: LinkDatum } = _.cloneDeep(
      linkCandidateDict
    );
    _.forEach(termListOfEG, (term, termIndex) => {
      const filteredLinkCandidates = _.chain(filteredLinkDict)
        .filter(
          (linkDatum, linkId) =>
            linkDatum.source === term || linkDatum.target === term
        )
        .orderBy((linkDatum) => linkDatum.count, ["desc"])
        .value();

      if (filteredLinkCandidates.length > maxOflinksPerNode) {
        for (
          let i = maxOflinksPerNode;
          i < filteredLinkCandidates.length;
          i++
        ) {
          delete filteredLinkDict[filteredLinkCandidates[i].id];
        }
      }
    });
    return _.values(filteredLinkDict);
  }
}

function convertTimeToSeconds(time: string): number {
  const parts = time.split(":").map((part) => parseInt(part, 10));
  return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
}
