import { Baggage } from './baggage';
import { MeasurementUnit } from './measurement';
import { ExtractedNodeRequestData, Primitive, WorkerLocation } from './misc';
import { Span, SpanContext } from './span';
/**
 * Interface holding Transaction-specific properties
 */
export interface TransactionContext extends SpanContext {
  /**
   * Human-readable identifier for the transaction
   */
  name: string;

  /**
   * If true, sets the end timestamp of the transaction to the highest timestamp of child spans, trimming
   * the duration of the transaction. This is useful to discard extra time in the transaction that is not
   * accounted for in child spans, like what happens in the idle transaction Tracing integration, where we finish the
   * transaction after a given "idle time" and we don't want this "idle time" to be part of the transaction.
   */
  trimEnd?: boolean;

  /**
   * If this transaction has a parent, the parent's sampling decision
   */
  parentSampled?: boolean;

  /**
   * Metadata associated with the transaction, for internal SDK use.
   */
  metadata?: TransactionMetadata;
}

/**
 * Data pulled from a `sentry-trace` header
 */
export type TraceparentData = Pick<TransactionContext, 'traceId' | 'parentSpanId' | 'parentSampled'>;

/**
 * Transaction "Class", inherits Span only has `setName`
 */
export interface Transaction extends TransactionContext, Span {
  /**
   * @inheritDoc
   */
  spanId: string;

  /**
   * @inheritDoc
   */
  traceId: string;

  /**
   * @inheritDoc
   */
  startTimestamp: number;

  /**
   * @inheritDoc
   */
  tags: { [key: string]: Primitive };

  /**
   * @inheritDoc
   */
  data: { [key: string]: any };

  /**
   * Metadata about the transaction
   */
  metadata: TransactionMetadata;

  /**
   * Set the name of the transaction
   */
  setName(name: string): void;

  /**
   * Set observed measurement for this transaction.
   *
   * @param name Name of the measurement
   * @param value Value of the measurement
   * @param unit Unit of the measurement. (Defaults to an empty string)
   */
  setMeasurement(name: string, value: number, unit: MeasurementUnit): void;

  /** Returns the current transaction properties as a `TransactionContext` */
  toContext(): TransactionContext;

  /** Updates the current transaction with a new `TransactionContext` */
  updateWithContext(transactionContext: TransactionContext): this;

  /** return the baggage for dynamic sampling and trace propagation */
  getBaggage(): Baggage;
}

/**
 * Context data passed by the user when starting a transaction, to be used by the tracesSampler method.
 */
export interface CustomSamplingContext {
  [key: string]: any;
}

/**
 * Data passed to the `tracesSampler` function, which forms the basis for whatever decisions it might make.
 *
 * Adds default data to data provided by the user. See {@link Hub.startTransaction}
 */
export interface SamplingContext extends CustomSamplingContext {
  /**
   * Context data with which transaction being sampled was created
   */
  transactionContext: TransactionContext;

  /**
   * Sampling decision from the parent transaction, if any.
   */
  parentSampled?: boolean;

  /**
   * Object representing the URL of the current page or worker script. Passed by default when using the `BrowserTracing`
   * integration.
   */
  location?: WorkerLocation;

  /**
   * Object representing the incoming request to a node server. Passed by default when using the TracingHandler.
   */
  request?: ExtractedNodeRequestData;
}

export type TransactionSamplingMethod = 'explicitly_set' | 'client_sampler' | 'client_rate' | 'inheritance';

export interface TransactionMetadata {
  transactionSampling?: { rate?: number; method: TransactionSamplingMethod };

  /** The baggage object of a transaction's baggage header, used for dynamic sampling  */
  baggage?: Baggage;

  /** For transactions tracing server-side request handling, the path of the request being tracked. */
  requestPath?: string;
}
