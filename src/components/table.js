import React from 'react';

class Table extends React.Component {
    constructor(props) {
        super(props);
    }

    generateHeaders() {
        const { data } = this.props;

        return Object.keys(data[0]).map((key) => {
            return <th key={key}> {key} </th>;
        });
    }

    generateRows() {
        const { data } = this.props;

        return data.map((row) => {
            var cells = Object.keys(row).map((key) => {
                return <td> {row[key]} </td>;
            });
            return <tr> { cells } </tr>;
        });
    }

    render() {
        return (
            <table className={"table responsive"}>
                <thead> { this.generateHeaders() } </thead>
                <tbody> { this.generateRows() } </tbody>
            </table>
        );
    }
}

module.exports = Table;
