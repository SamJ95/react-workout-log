import React, { Component } from 'react';
import moment from 'moment';
import { hashHistory } from 'react-router';

import Workouts from '../components/Workouts';

class WorkoutsContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      workouts: []
    };

    // set up Firebase
    this.db = this.props.route.db;

    this.onAddWorkout = this.onAddWorkout.bind(this);
    this.onUpdateWorkout = this.onUpdateWorkout.bind(this);
    this.onDeleteWorkout = this.onDeleteWorkout.bind(this);

    this.addWorkout = this.addWorkout.bind(this);
    this.updateWorkout = this.updateWorkout.bind(this);
    this.deleteWorkout = this.deleteWorkout.bind(this);
  }

  componentDidMount() {
    this.db.workouts.on('child_added', (data) => {
      var workout = data.val();

      this.addWorkout({
        ...workout,
        date: moment.unix(workout.date).format('YYYY-MM-DD'), // convert timestamp
        ref: data.key
      });
    });

    this.db.workouts.on('child_changed', (data) => {
      var workout = data.val();

      this.updateWorkout({
        ...workout,
        date: moment.unix(workout.date).format('YYYY-MM-DD') // convert timestamp
      });
    });

    this.db.workouts.on('child_removed', (data) => {
      this.deleteWorkout(data.val().id);
    });
  }

  onAddWorkout({ id, date = false, exercises = [] }) {
    date = date || moment().format('YYYY-MM-DD');

    this.db.addWorkout({ id, date, exercises });
  }

  onUpdateWorkout({ id, date = false, exercises = [] }) {
    const workout = this.state.workouts.find(workout => id === workout.id);

    date = date || moment().format('YYYY-MM-DD');

    this.db.updateWorkout(workout.ref, { id, date, exercises });
  }

  onDeleteWorkout(id) {
    if (id === 'new') {
      return;
    }

    const workout = this.state.workouts.find(workout => id === workout.id);

    this.db.deleteWorkout(workout.ref);
  }

  addWorkout({ id, ref, date = false, exercises = [] }) {
    date = date || moment().format('YYYY-MM-DD');

    this.setState({
      workouts: [...this.state.workouts, { 
        id,
        ref,
        date,
        exercises
      }]
    });

    hashHistory.push('/workouts/' + id);
  }

  updateWorkout(updatedWorkout) {
    this.setState({
      workouts: this.state.workouts.map((workout) => {
        if (workout.id !== updatedWorkout.id) {
          return workout;
        }

        return Object.assign({}, workout, updatedWorkout);
      })
    });
  }

  deleteWorkout(id) {
    this.setState({
      workouts: this.state.workouts.filter(workout => workout.id !== id)
    });

    hashHistory.push('/workouts/new');
  }

  getDefaultWorkout() {
    return {
      id: "new",
      date: undefined,
      exercises: []
    };
  }

  getActiveWorkout() {
    const defaultWorkout = this.getDefaultWorkout();

    if (typeof this.props.params.workoutId === "undefined") {
      return defaultWorkout;
    }

    var activeWorkout = this.getDefaultWorkout();
    var workoutId = this.props.params.workoutId;
    var isClone = false;

    if (workoutId === "new") {
      if (typeof this.props.location.query.clone === "undefined") {
        return defaultWorkout;
      }
      
      workoutId = this.props.location.query.clone;
      isClone = true;
    }

    activeWorkout = this.state.workouts.reduce((prev, workout) => {
      return workout.id === workoutId ? {...workout} : prev;
    }, defaultWorkout);

    if (isClone) {
      activeWorkout.id = "new";
    }

    return activeWorkout;
  }

  render() {
    const activeWorkout = this.getActiveWorkout();

    return (
      <Workouts 
        workouts={this.state.workouts}
        activeWorkout={activeWorkout}
        onAddWorkout={this.onAddWorkout}
        onUpdateWorkout={this.onUpdateWorkout}
        onDeleteWorkout={this.onDeleteWorkout}
      />
    );
  }
}

export default WorkoutsContainer;