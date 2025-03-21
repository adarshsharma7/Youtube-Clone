import * as actionTypes from './actionTypes';

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.FETCHED_ALL_VIDEOS:
      return {
        ...state,
        fetchedAllVideos: action.payload,
      };
    case actionTypes.FETCHED_PROFILE:
      return {
        ...state,
        profile: action.payload,
      };
    case actionTypes.SET_LIKED_ERROR:
      return {
        ...state,
        likedError: action.payload,
      };
    case actionTypes.SET_WATCHHISTORY_ERROR:
      return {
        ...state,
        watchHistoryError: action.payload,
      };
    case actionTypes.SET_UPLOADEDVIDEOS_ERROR:
      return {
        ...state,
        uploadedVideosError: action.payload,
      };
      case actionTypes.UPDATE_WATCH_HISTORY:
        return {
          ...state,
          profile: {
            ...state.profile,
            watchHistory: action.payload,
          },
        };
        case actionTypes.CURRENT_USER_AVATAR:
          return {
            ...state,
            currentUserAvatar: action.payload,
          };
        case actionTypes.SET_SUBSCRIBER_COUNT:
          return {
            ...state,
            subscriberCount: action.payload,
          };
        case actionTypes.SET_USER_SUBSCRIBE:
          return {
            ...state,
            userSubscribe: action.payload,
          };
        case actionTypes.SET_IS_SUBSCRIBE:
          return {
            ...state,
            isSubscribe: action.payload,
          };
        case actionTypes.UPDATE_UPLOADED_VIDEOS:
          return {
            ...state,profile:{...state.profile, uploadedVideos: action.payload,}
          
          };
        case actionTypes.UPDATE_WATCHLATER_VIDEOS:
          return {
            ...state,profile:{...state.profile, watchLater: action.payload,}
          
          };
        case actionTypes.UPDATE_COMMENT_REPLY:
          return {
            ...state,
            commentArray:action.payload,
          
          };
          case actionTypes.UPDATED_PROFILE:
            return {
                ...state,
                profile: {
                    ...state.profile,
                    username: action.payload.username,
                    fullName: action.payload.fullName,
                    avatar: action.payload.avatar,
                },
            };
      default:
        return state;
  }
};

export default reducer;
