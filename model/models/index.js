const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

// ---------- Users / Roles ----------
const UserSchema = new Schema({
    email:         { type: String, required: true, unique: true, index: true },
    passwordHash:  { type: String, required: true },
    displayName:   { type: String, required: true },
    phone:         { type: String },
    isVerified:    { type: Boolean, default: false },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

const RoleSchema = new Schema({
    name:          { type: String, required: true, unique: true }
}, { timestamps: true });

const UserRoleSchema = new Schema({
    userId:        { type: Types.ObjectId, ref: 'User', required: true, index: true },
    roleId:        { type: Types.ObjectId, ref: 'Role', required: true, index: true },
}, { timestamps: true });
UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

// ---------- Adults / Children / Links / Consents ----------
const AdultSchema = new Schema({
    userId:        { type: Types.ObjectId, ref: 'User', required: true, index: true },
    legalName:     { type: String, required: true },
    address:       { type: String },
    govIdType:     { type: String },           // e.g., "DL", "Passport"
    govIdLast4:    { type: String, match: /^\d{4}$/ },
    photoUrl:      { type: String },
}, { timestamps: true });

const ChildSchema = new Schema({
    fullName:      { type: String, required: true, index: true },
    birthdate:     { type: Date, required: true },
    photoUrl:      { type: String },
}, { timestamps: true });

const ConsentSchema = new Schema({
    childId:            { type: Types.ObjectId, ref: 'Child', required: true, index: true },
    consentingAdultId:  { type: Types.ObjectId, ref: 'Adult', required: true, index: true },
    type:               { type: String, required: true },  // e.g., "medical", "photo", "travel"
    signedAt:           { type: Date, required: true, default: Date.now },
    documentUrl:        { type: String },
}, { timestamps: true });

const AdultChildLinkSchema = new Schema({
    adultId:      { type: Types.ObjectId, ref: 'Adult', required: true, index: true },
    childId:      { type: Types.ObjectId, ref: 'Child', required: true, index: true },
    relation:     { type: String, required: true },        // "Parent", "Guardian", "Trusted Adult"
    isPrimary:    { type: Boolean, default: false },
    consentId:    { type: Types.ObjectId, ref: 'Consent' },
}, { timestamps: true });
AdultChildLinkSchema.index({ adultId: 1, childId: 1 }, { unique: true });

// ---------- Seasons / Teams / Managers / Roster ----------
const SeasonSchema = new Schema({
    name:         { type: String, required: true, unique: true },
    startDate:    { type: Date, required: true },
    endDate:      { type: Date, required: true },
    maxTeams:     { type: Number, required: true },
    minPlayers:   { type: Number, required: true },
    maxPlayers:   { type: Number, required: true },
}, { timestamps: true });

const TeamSchema = new Schema({
    seasonId:     { type: Types.ObjectId, ref: 'Season', required: true, index: true },
    name:         { type: String, required: true },
    logoUrl:      { type: String },
    colorPrimary: { type: String },
}, { timestamps: true });
TeamSchema.index({ seasonId: 1, name: 1 }, { unique: true });

const TeamManagerSchema = new Schema({
    teamId:       { type: Types.ObjectId, ref: 'Team', required: true, unique: true },
    adultId:      { type: Types.ObjectId, ref: 'Adult', required: true, index: true },
}, { timestamps: true });

const RosterMemberSchema = new Schema({
    teamId:       { type: Types.ObjectId, ref: 'Team', required: true, index: true },
    childId:      { type: Types.ObjectId, ref: 'Child', required: true, index: true },
    jerseyNumber: { type: Number },
}, { timestamps: true });
RosterMemberSchema.index({ teamId: 1, childId: 1 }, { unique: true });

// ---------- Venues ----------
const VenueSchema = new Schema({
    name:         { type: String, required: true },
    address:      { type: String },
    city:         { type: String },
    state:        { type: String },
    capacity:     { type: Number },
}, { timestamps: true });

// ---------- Tournaments / Brackets / Matches ----------
const TournamentSchema = new Schema({
    seasonId:     { type: Types.ObjectId, ref: 'Season', required: true, index: true },
    name:         { type: String, required: true },
    bracketStyle: { type: String, required: true }, // "single_elim", "double_elim", "round_robin"
    seeded:       { type: Boolean, default: false },
}, { timestamps: true });
TournamentSchema.index({ seasonId: 1, name: 1 }, { unique: true });

const BracketSchema = new Schema({
    tournamentId: { type: Types.ObjectId, ref: 'Tournament', required: true, index: true },
    generatedAt:  { type: Date, default: Date.now },
    status:       { type: String, default: 'draft' }, // "draft","active","complete"
}, { timestamps: true });

const MatchSchema = new Schema({
    tournamentId: { type: Types.ObjectId, ref: 'Tournament', required: true, index: true },
    roundNumber:  { type: Number, required: true },
    bracketSlot:  { type: Number, required: true },
    teamAId:      { type: Types.ObjectId, ref: 'Team' },
    teamBId:      { type: Types.ObjectId, ref: 'Team' },
    winnerTeamId: { type: Types.ObjectId, ref: 'Team' },
    status:       { type: String, default: 'scheduled' }, // "scheduled","in_progress","complete"
}, { timestamps: true });
MatchSchema.index({ tournamentId: 1, roundNumber: 1, bracketSlot: 1 }, { unique: true });

// ---------- Games / Updates / Streams / Videos ----------
const GameSchema = new Schema({
    matchId:      { type: Types.ObjectId, ref: 'Match', required: true, index: true },
    venueId:      { type: Types.ObjectId, ref: 'Venue', required: true, index: true },
    startsAt:     { type: Date, required: true, index: true },
    endsAt:       { type: Date },
    homeTeamId:   { type: Types.ObjectId, ref: 'Team', required: true },
    awayTeamId:   { type: Types.ObjectId, ref: 'Team', required: true },
    scoreHome:    { type: Number, default: 0 },
    scoreAway:    { type: Number, default: 0 },
    status:       { type: String, default: 'scheduled' }, // "scheduled","live","finished","canceled","delayed"
}, { timestamps: true });

const GameUpdateSchema = new Schema({
    gameId:       { type: Types.ObjectId, ref: 'Game', required: true, index: true },
    type:         { type: String, required: true }, // "canceled","delayed","info"
    message:      { type: String, required: true },
    createdBy:    { type: Types.ObjectId, ref: 'User', required: true, index: true },
    createdAt:    { type: Date, default: Date.now },
}, { timestamps: true });

const VideoSchema = new Schema({
    gameId:       { type: Types.ObjectId, ref: 'Game', index: true },
    uploadedBy:   { type: Types.ObjectId, ref: 'User', required: true, index: true },
    url:          { type: String, required: true },
    duration:     { type: Number },
    isArchived:   { type: Boolean, default: false },
}, { timestamps: true });

const LivestreamSchema = new Schema({
    gameId:       { type: Types.ObjectId, ref: 'Game', required: true, unique: true },
    provider:     { type: String, required: true },     // "youtube","twitch","rtmp"
    streamKey:    { type: String },
    playbackUrl:  { type: String },
    status:       { type: String, default: 'offline' }, // "offline","live","ended"
}, { timestamps: true });

// ---------- Photos ----------
const PhotoSchema = new Schema({
    uploadedBy:   { type: Types.ObjectId, ref: 'User', required: true, index: true },
    teamId:       { type: Types.ObjectId, ref: 'Team', index: true },
    gameId:       { type: Types.ObjectId, ref: 'Game', index: true },
    url:          { type: String, required: true },
    visibleTo:    { type: String, default: 'registered' }, // "public","registered","team","private"
}, { timestamps: true });

// ---------- Posts / Comments / Reactions ----------
const PostSchema = new Schema({
    authorUserId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    title:        { type: String, required: true },
    body:         { type: String, required: true },
    createdAt:    { type: Date, default: Date.now }
}, { timestamps: true });

const CommentSchema = new Schema({
    parentType:   { type: String, required: true },     // "post","video","photo","game"
    parentId:     { type: Types.ObjectId, required: true, index: true },
    userId:       { type: Types.ObjectId, ref: 'User', required: true, index: true },
    text:         { type: String, required: true },
    createdAt:    { type: Date, default: Date.now }
}, { timestamps: true });

const ReactionSchema = new Schema({
    parentType:   { type: String, required: true },     // "post","comment","video","photo"
    parentId:     { type: Types.ObjectId, required: true, index: true },
    userId:       { type: Types.ObjectId, ref: 'User', required: true, index: true },
    kind:         { type: String, required: true },     // "like","dislike","heart"...
    createdAt:    { type: Date, default: Date.now }
}, { timestamps: true });
ReactionSchema.index({ parentType: 1, parentId: 1, userId: 1, kind: 1 }, { unique: true });

// ---------- Sponsors / Sponsorships / Inquiries ----------
const SponsorSchema = new Schema({
    orgName:      { type: String, required: true },
    contactEmail: { type: String },
    websiteUrl:   { type: String },
    logoUrl:      { type: String },
}, { timestamps: true });

const SponsorshipSchema = new Schema({
    sponsorId:    { type: Types.ObjectId, ref: 'Sponsor', required: true, index: true },
    seasonId:     { type: Types.ObjectId, ref: 'Season', required: true, index: true },
    tier:         { type: String, required: true },     // "gold","silver","bronze"
    startDate:    { type: Date, required: true },
    endDate:      { type: Date, required: true },
}, { timestamps: true });
SponsorshipSchema.index({ sponsorId: 1, seasonId: 1 }, { unique: true });

const SponsorInquirySchema = new Schema({
    name:         { type: String, required: true },
    email:        { type: String, required: true },
    message:      { type: String, required: true },
    status:       { type: String, default: 'new' },     // "new","reviewing","closed"
}, { timestamps: true });

// ---------- Announcements ----------
const AnnouncementSchema = new Schema({
    scope:        { type: String, required: true },     // "global","season","team","game"
    scopeId:      { type: Types.ObjectId },             // ref varies by scope
    title:        { type: String, required: true },
    message:      { type: String, required: true },
    createdBy:    { type: Types.ObjectId, ref: 'User', required: true, index: true },
    createdAt:    { type: Date, default: Date.now },
}, { timestamps: true });

// ---------- Subscriptions ----------
const SubscriptionSchema = new Schema({
    userId:       { type: Types.ObjectId, ref: 'User', required: true, index: true },
    type:         { type: String, required: true },     // "game_updates","season_news","team_news"
}, { timestamps: true });
SubscriptionSchema.index({ userId: 1, type: 1 }, { unique: true });

// ---------- Export models ----------
module.exports = {
    User: model('User', UserSchema),
    Role: model('Role', RoleSchema),
    UserRole: model('UserRole', UserRoleSchema),

    Adult: model('Adult', AdultSchema),
    Child: model('Child', ChildSchema),
    Consent: model('Consent', ConsentSchema),
    AdultChildLink: model('AdultChildLink', AdultChildLinkSchema),

    Season: model('Season', SeasonSchema),
    Team: model('Team', TeamSchema),
    TeamManager: model('TeamManager', TeamManagerSchema),
    RosterMember: model('RosterMember', RosterMemberSchema),

    Venue: model('Venue', VenueSchema),
    Tournament: model('Tournament', TournamentSchema),
    Bracket: model('Bracket', BracketSchema),
    Match: model('Match', MatchSchema),
    Game: model('Game', GameSchema),
    GameUpdate: model('GameUpdate', GameUpdateSchema),

    Video: model('Video', VideoSchema),
    Livestream: model('Livestream', LivestreamSchema),
    Photo: model('Photo', PhotoSchema),

    Post: model('Post', PostSchema),
    Comment: model('Comment', CommentSchema),
    Reaction: model('Reaction', ReactionSchema),

    Sponsor: model('Sponsor', SponsorSchema),
    Sponsorship: model('Sponsorship', SponsorshipSchema),
    SponsorInquiry: model('SponsorInquiry', SponsorInquirySchema),

    Announcement: model('Announcement', AnnouncementSchema),
    Subscription: model('Subscription', SubscriptionSchema),
};
