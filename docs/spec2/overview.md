## Introduction

This is the official specification for the DATEX Protocol Language.
You can find this document on [github.com](https://github.com/unyt-org/datex-specification) and [docs.unyt.org](https://docs.unyt.org/datex).

DATEX is a communication protocol and language that provides realtime data exchange and synchronization for distributed applications.

The DATEX specification is an open standard that is designed to be implemented for various platforms, including
 * embedded devices
 * web applications
 * mobile application
 * desktop applications

DATEX is a flexible protocol that combines the Application, Session, Transport, and Network layer of the OSI Model.
The protocol offers encryption, signatures and authentication functionality.

DATEX introduces the concept of endpoints that form a peer-to-peer network, replacing the common server-client architecture.

DATEX incorporates a global shared memory that enables data synchronization between network participants (endpoints).
In addition, DATEX includes a general-purpose type system which is designed to interface with common programming languages.

This specification describes
 * the *DATEX Binary Format* (**DXB**) - the machine-readable bytecode format for DATEX
 * the *DATEX Script Language* (**DX** or just **DATEX**) - a human-readable representation of DATEX that gets compiled to DXB, designed
   as a full-featured programming language while still being a superset of JSON.