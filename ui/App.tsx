import { h, Component } from 'preact'
import io from 'socket.io-client'
import { Option } from 'prelude-ts'

import * as Logger from './Logger'
import Playback from './Playback'
import { Message, TrackInfo, Volume } from '../server/Models'

interface AppState {
    currentTrack: Option<TrackInfo>
    volume: Volume
    infoMessages: Array<String>
}

const initialState: AppState = {
    currentTrack: Option.none<TrackInfo>(),

    volume: {
        type: 'audible',
        volume: 0
    },
    infoMessages: []
}

export default class App extends Component<{}, AppState> {
    logger = Logger.create()
    socket = io('/', {
        autoConnect: false
    })
    state = initialState

    componentDidMount() {
        this.socket.on('message', (message: Message) => {
            this.logger.debug('Received message', message)

            switch (message.type) {
                case 'playback':
                    return this.setState({
                        currentTrack: Option.of(message.data)
                    })
                case 'info':
                    return this.setState({
                        infoMessages: this.state.infoMessages.concat([
                            message.data
                        ])
                    })
                case 'volume':
                    return this.setState({
                        volume: message.data
                    })
            }
        })
        this.socket.open()
    }

    componentWillUnmount() {
        this.socket.close()
    }

    render() {
        if (this.socket.disconnected || this.state.currentTrack.isNone()) {
            return (
                <div>
                    <h1>Connecting</h1>
                </div>
            )
        } else {
            return (
                <div>
                    <h1>Ready</h1>
                    <Playback currentTrack={this.state.currentTrack.get()} />
                </div>
            )
        }
    }
}
