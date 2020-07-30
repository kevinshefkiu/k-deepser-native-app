import React, {Component} from "react";
import {View, Text, FlatList, ActivityIndicator, StyleSheet} from "react-native";
import {ListItem, SearchBar, Header} from "react-native-elements";
import {Left, Right, Icon} from 'native-base';
import AsyncStorage from "@react-native-community/async-storage";
import DeepAPI from "../../api/lib/src/class/DeepAPI";
import {Operation, User} from "../../api/lib/src/class/DeepEntity";


class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: '',
            loading: false,
            page: 1,
            seed: 1,
            data: [],
            error: null,
            refreshing: false
        };
    }

    getData = async () => {
        try {
            const item = await AsyncStorage.getItem('userprofile');
            const jsonValue = JSON.parse(item);
            return jsonValue;
        } catch (err) {
            console.log(err);
        }
    }

    componentDidMount() {
        this.makeRemoteRequest();
    }

    makeRemoteRequest = async () => {
        const {page, seed} = this.state;

        let dati = await this.getData();
        DeepAPI.getInstance()
            .setHost(dati[1].host)
            .setToken(dati[0].api_token)
            .setAuthMode('Bearer');


        let us = (new Operation()).getCollection();
        let collection = await us.loadCollection();

        this.setState({
            data: page === 1 ? collection.items : [...this.state.data, ...collection.items],
            loading: false,
            refreshing: false
        })
        console.log(this.state.data);

    };

    handleRefresh = () => {
        this.setState(
            {
                page: 1,
                refreshing: true,
                seed: this.state.seed + 1.
            },
            () => {
                this.makeRemoteRequest();
            }
        );
    };

    renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: "100%",
                    backgroundColor: "#CED0CE",
                }}
            />
        );
    };
    updateSearch = (search) => {
        this.setState({search});
    };

    renderHeader = () => {
        const {search} = this.state;
        return <SearchBar placeholder="Type Here..."
                          onChangeText={this.updateSearch}
                          value={search}
                          lightTheme round/>;
    };

    renderFooter = () => {
        if (!this.state.loading) return null;

        return (
            <View
                style={{
                    paddingVertical: 20,
                    borderTopWidth: 1,
                    borderColor: "#CED0CE"
                }}
            >
                <ActivityIndicator animating size="large"/>
            </View>
        );
    };

    render() {
        return (
            <View>
                <Header
                    leftComponent={<Icon name="menu" onPress={() => this.props.navigation.openDrawer()}/>}
                />
                <View>
                    <FlatList
                        data={this.state.data}
                        renderItem={({item}) => (
                            <ListItem
                                title={`${item.title}`}
                                containerStyle={{borderBottomWidth: 0}}
                            />
                        )}
                        keyExtractor={item => item.title}
                        ItemSeparatorComponent={this.renderSeparator}
                        ListFooterComponent={this.renderFooter}
                        ListHeaderComponent={this.renderHeader}
                        refreshing={this.state.refreshing}
                        onEndReached={this.handleLoadMore}
                        onEndReachedThreshold={0.4}

                    />
                </View>
            </View>
        );
    }
}

export default Dashboard;
